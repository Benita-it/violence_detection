import os
import sys
import argparse
import numpy as np
import matplotlib.pyplot as plt
import tensorflow as tf

from sklearn.metrics import (
    confusion_matrix,
    classification_report,
    roc_curve,
    auc,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score
)

from ml.preprocess import (
    load_video_dataset,
    get_train_val_test_splits
)


def evaluate_model(
    model_path,
    dataset_dir,
    sequence_length=20,
    frame_size=224,
    batch_size=2,
    max_videos=300
):

    print("\n" + "=" * 60)
    print("VIOLENCE DETECTION MODEL EVALUATION")
    print("=" * 60)

    # ---------------------------------------------------------
    # Check model
    # ---------------------------------------------------------
    if not os.path.exists(model_path):
        print(f"\nERROR: Model not found:")
        print(model_path)
        print("\nTrain the model first.")
        return

    # ---------------------------------------------------------
    # Check dataset
    # ---------------------------------------------------------
    violence_dir = os.path.join(dataset_dir, "Violence")
    nonviolence_dir = os.path.join(dataset_dir, "NonViolence")

    if not os.path.exists(violence_dir):
        print(f"\nERROR: Violence folder not found:")
        print(violence_dir)
        return

    if not os.path.exists(nonviolence_dir):
        print(f"\nERROR: NonViolence folder not found:")
        print(nonviolence_dir)
        return

    # ---------------------------------------------------------
    # Load model
    # ---------------------------------------------------------
    print("\nLoading trained model...")

    try:
        model = tf.keras.models.load_model(model_path)
    except Exception as e:
        print("\nERROR while loading model:")
        print(e)
        return

    print("Model loaded successfully.")

    # ---------------------------------------------------------
    # Load dataset
    # ---------------------------------------------------------
    print("\nLoading dataset...")
    print(f"Maximum videos per class: {max_videos}")

    try:
        X, y = load_video_dataset(
            dataset_dir=dataset_dir,
            sequence_length=sequence_length,
            frame_size=frame_size,
            max_videos_per_class=max_videos
        )
    except Exception as e:
        print("\nERROR while loading dataset:")
        print(e)
        return

    if len(X) == 0:
        print("\nERROR: No data found.")
        return

    print(f"\nTotal sequences: {len(X)}")
    print(f"Violence sequences: {np.sum(y == 1)}")
    print(f"NonViolence sequences: {np.sum(y == 0)}")

    # ---------------------------------------------------------
    # Split dataset
    # ---------------------------------------------------------
    print("\nCreating train / validation / test split...")

    try:
        _, _, X_test, _, _, y_test = get_train_val_test_splits(
            X,
            y,
            random_state=42
        )
    except Exception as e:
        print("\nERROR while splitting dataset:")
        print(e)
        return

    print(f"Test sequences: {len(X_test)}")

    # ---------------------------------------------------------
    # Evaluate
    # ---------------------------------------------------------
    print("\nRunning model prediction...")

    y_probability = model.predict(
        X_test,
        batch_size=batch_size,
        verbose=1
    ).ravel()

    y_pred = (y_probability >= 0.5).astype(int)

    # ---------------------------------------------------------
    # Metrics
    # ---------------------------------------------------------
    accuracy = accuracy_score(y_test, y_pred)

    precision = precision_score(
        y_test,
        y_pred,
        zero_division=0
    )

    recall = recall_score(
        y_test,
        y_pred,
        zero_division=0
    )

    f1 = f1_score(
        y_test,
        y_pred,
        zero_division=0
    )

    # ---------------------------------------------------------
    # Print results
    # ---------------------------------------------------------
    print("\n" + "=" * 60)
    print("EVALUATION RESULTS")
    print("=" * 60)

    print(f"\nAccuracy  : {accuracy:.4f}")
    print(f"Precision : {precision:.4f}")
    print(f"Recall    : {recall:.4f}")
    print(f"F1 Score  : {f1:.4f}")

    # ---------------------------------------------------------
    # Classification report
    # ---------------------------------------------------------
    print("\n" + "-" * 60)
    print("CLASSIFICATION REPORT")
    print("-" * 60)

    print(
        classification_report(
            y_test,
            y_pred,
            target_names=["NonViolence", "Violence"],
            zero_division=0
        )
    )

    # ---------------------------------------------------------
    # Confusion Matrix
    # ---------------------------------------------------------
    cm = confusion_matrix(y_test, y_pred)

    print("\n" + "-" * 60)
    print("CONFUSION MATRIX")
    print("-" * 60)

    print(cm)

    # ---------------------------------------------------------
    # False Positive / False Negative
    # ---------------------------------------------------------
    if cm.shape == (2, 2):

        tn, fp, fn, tp = cm.ravel()

        print("\nTrue Negative  :", tn)
        print("False Positive :", fp)
        print("False Negative :", fn)
        print("True Positive  :", tp)

        false_positive_rate = (
            fp / (fp + tn)
            if (fp + tn) > 0
            else 0
        )

        false_negative_rate = (
            fn / (fn + tp)
            if (fn + tp) > 0
            else 0
        )

        print(
            f"\nFalse Positive Rate : "
            f"{false_positive_rate:.4f}"
        )

        print(
            f"False Negative Rate : "
            f"{false_negative_rate:.4f}"
        )

    # ---------------------------------------------------------
    # Create output directory
    # ---------------------------------------------------------
    output_dir = os.path.dirname(model_path)

    if output_dir == "":
        output_dir = "."

    os.makedirs(output_dir, exist_ok=True)

    # ---------------------------------------------------------
    # Confusion Matrix Plot
    # ---------------------------------------------------------
    plt.figure(figsize=(7, 6))

    plt.imshow(cm)

    plt.title("Confusion Matrix")
    plt.xlabel("Predicted Label")
    plt.ylabel("Actual Label")

    plt.xticks(
        [0, 1],
        ["NonViolence", "Violence"]
    )

    plt.yticks(
        [0, 1],
        ["NonViolence", "Violence"]
    )

    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            plt.text(
                j,
                i,
                str(cm[i, j]),
                ha="center",
                va="center"
            )

    plt.tight_layout()

    confusion_path = os.path.join(
        output_dir,
        "confusion_matrix.png"
    )

    plt.savefig(confusion_path)
    plt.close()

    print(
        f"\nConfusion matrix saved to:"
        f"\n{confusion_path}"
    )

    # ---------------------------------------------------------
    # ROC Curve
    # ---------------------------------------------------------
    if len(np.unique(y_test)) == 2:

        fpr, tpr, thresholds = roc_curve(
            y_test,
            y_probability
        )

        roc_auc = auc(fpr, tpr)

        print(f"\nROC-AUC : {roc_auc:.4f}")

        plt.figure(figsize=(7, 6))

        plt.plot(
            fpr,
            tpr,
            label=f"ROC curve (AUC = {roc_auc:.4f})"
        )

        plt.plot(
            [0, 1],
            [0, 1],
            linestyle="--"
        )

        plt.xlabel("False Positive Rate")
        plt.ylabel("True Positive Rate")

        plt.title("ROC Curve")

        plt.legend(loc="lower right")

        plt.tight_layout()

        roc_path = os.path.join(
            output_dir,
            "roc_curve.png"
        )

        plt.savefig(roc_path)
        plt.close()

        print(
            f"ROC curve saved to:"
            f"\n{roc_path}"
        )

    # ---------------------------------------------------------
    # Final result
    # ---------------------------------------------------------
    print("\n" + "=" * 60)
    print("EVALUATION COMPLETED")
    print("=" * 60)

    print("\nFinal Metrics:")
    print(f"Accuracy  : {accuracy * 100:.2f}%")
    print(f"Precision : {precision * 100:.2f}%")
    print(f"Recall    : {recall * 100:.2f}%")
    print(f"F1 Score  : {f1 * 100:.2f}%")

    print("\n")


def main():

    parser = argparse.ArgumentParser(
        description="Evaluate Violence Detection Model"
    )

    parser.add_argument(
        "--model",
        default="backend/app/models/violence_model.h5"
    )

    parser.add_argument(
        "--dataset",
        default="dataset"
    )

    parser.add_argument(
        "--sequence_length",
        type=int,
        default=20
    )

    parser.add_argument(
        "--frame_size",
        type=int,
        default=224
    )

    parser.add_argument(
        "--batch_size",
        type=int,
        default=2
    )

    parser.add_argument(
        "--max_videos",
        type=int,
        default=300
    )

    args = parser.parse_args()

    evaluate_model(
        model_path=args.model,
        dataset_dir=args.dataset,
        sequence_length=args.sequence_length,
        frame_size=args.frame_size,
        batch_size=args.batch_size,
        max_videos=args.max_videos
    )


if __name__ == "__main__":
    main()