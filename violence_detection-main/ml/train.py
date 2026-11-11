import argparse
import shutil
from pathlib import Path

import tensorflow as tf
import matplotlib.pyplot as plt

from tensorflow.keras.callbacks import (
    ModelCheckpoint,
    EarlyStopping,
    ReduceLROnPlateau
)

from ml.model import build_cnn_lstm_model
from ml.preprocess import create_generators


def plot_training_history(history, output_path="training_metrics.png"):

    plt.figure(figsize=(14, 5))

    plt.subplot(1, 2, 1)

    plt.plot(
        history.history["accuracy"],
        label="Train Accuracy"
    )

    plt.plot(
        history.history["val_accuracy"],
        label="Validation Accuracy"
    )

    plt.title("Model Accuracy")
    plt.xlabel("Epoch")
    plt.ylabel("Accuracy")
    plt.legend()
    plt.grid(True)

    plt.subplot(1, 2, 2)

    plt.plot(
        history.history["loss"],
        label="Train Loss"
    )

    plt.plot(
        history.history["val_loss"],
        label="Validation Loss"
    )

    plt.title("Model Loss")
    plt.xlabel("Epoch")
    plt.ylabel("Loss")
    plt.legend()
    plt.grid(True)

    plt.tight_layout()

    plt.savefig(
        output_path,
        dpi=300
    )

    plt.close()

    print(f"[+] Training graph saved to: {output_path}")


def main():

    parser = argparse.ArgumentParser(
        description="CNN-LSTM Video Violence Detection Training"
    )

    parser.add_argument(
        "--data_dir",
        type=str,
        default="dataset",
        help="Path to dataset folder"
    )

    parser.add_argument(
        "--epochs",
        type=int,
        default=5,
        help="Number of training epochs"
    )

    parser.add_argument(
        "--batch_size",
        type=int,
        default=1,
        help="Training batch size"
    )

    parser.add_argument(
        "--learning_rate",
        type=float,
        default=1e-4,
        help="Learning rate"
    )

    parser.add_argument(
        "--output_model",
        type=str,
        default="violence_model.h5",
        help="Output model file"
    )

    parser.add_argument(
        "--max_videos",
        type=int,
        default=300,
        help="Maximum videos per class"
    )

    args = parser.parse_args()

    # ---------------------------------------------------------
    # Project paths
    # ---------------------------------------------------------

    project_root = (
        Path(__file__)
        .resolve()
        .parent
        .parent
    )

    dataset_dir = (
        project_root /
        args.data_dir
    )

    output_model = (
        project_root /
        args.output_model
    )

    training_graph = (
        project_root /
        "training_metrics.png"
    )

    backend_model_dir = (
        project_root /
        "backend" /
        "app" /
        "models"
    )

    backend_model = (
        backend_model_dir /
        "violence_model.h5"
    )

    # ---------------------------------------------------------
    # Information
    # ---------------------------------------------------------

    print("=" * 70)
    print(" CNN-LSTM VIDEO VIOLENCE DETECTION TRAINING ")
    print("=" * 70)

    print(f"Project Root : {project_root}")
    print(f"Dataset      : {dataset_dir}")
    print(f"Epochs       : {args.epochs}")
    print(f"Batch Size   : {args.batch_size}")
    print(f"Max Videos   : {args.max_videos} per class")
    print(f"Output Model : {output_model}")

    print("=" * 70)

    # ---------------------------------------------------------
    # Dataset validation
    # ---------------------------------------------------------

    if not dataset_dir.exists():

        raise FileNotFoundError(
            f"Dataset folder not found: {dataset_dir}"
        )

    violence_dir = (
        dataset_dir /
        "Violence"
    )

    nonviolence_dir = (
        dataset_dir /
        "NonViolence"
    )

    if not violence_dir.exists():

        raise FileNotFoundError(
            f"Violence folder not found: {violence_dir}"
        )

    if not nonviolence_dir.exists():

        raise FileNotFoundError(
            f"NonViolence folder not found: {nonviolence_dir}"
        )

    # ---------------------------------------------------------
    # Create generators
    # ---------------------------------------------------------

    print("\n[*] Creating RAM-safe data generators...")

    (
        train_generator,
        val_generator,
        test_generator
    ) = create_generators(

        dataset_dir=str(dataset_dir),

        max_videos_per_class=args.max_videos,

        batch_size=args.batch_size,

        sequence_length=20,

        frame_size=224,

        frame_skip=2,

        sequence_stride=10,

        random_state=42
    )

    print("\n[+] Generators created successfully.")

    print(
        f"Train batches      : "
        f"{len(train_generator)}"
    )

    print(
        f"Validation batches : "
        f"{len(val_generator)}"
    )

    print(
        f"Test batches       : "
        f"{len(test_generator)}"
    )

    # ---------------------------------------------------------
    # Test first batch
    # ---------------------------------------------------------

    print("\n[*] Testing first training batch...")

    x_batch, y_batch = train_generator[0]

    print("[+] First batch loaded successfully")
    print("X shape:", x_batch.shape)
    print("Y shape:", y_batch.shape)

    # ---------------------------------------------------------
    # Build model
    # ---------------------------------------------------------

    print("\n[*] Building CNN-LSTM model...")

    model = build_cnn_lstm_model(

        sequence_length=20,

        frame_size=224,

        learning_rate=args.learning_rate
    )

    model.summary()

    # ---------------------------------------------------------
    # Callbacks
    # ---------------------------------------------------------

    print("\n[*] Preparing training callbacks...")

    callbacks = [

        ModelCheckpoint(

            filepath=str(output_model),

            monitor="val_loss",

            mode="min",

            save_best_only=True,

            verbose=1
        ),

        EarlyStopping(

            monitor="val_loss",

            patience=8,

            restore_best_weights=True,

            verbose=1
        ),

        ReduceLROnPlateau(

            monitor="val_loss",

            factor=0.5,

            patience=4,

            min_lr=1e-6,

            verbose=1
        )
    ]

    # ---------------------------------------------------------
    # Training
    # ---------------------------------------------------------

    print("\n[*] Starting training...")
    print("=" * 70)

    try:

        history = model.fit(

            train_generator,

            validation_data=val_generator,

            epochs=args.epochs,

            callbacks=callbacks,

            verbose=1
        )

    except KeyboardInterrupt:

        print("\n[!] Training interrupted by user.")

        return

    except Exception as error:

        print("\n[!] Training failed.")
        print("Error:", error)

        raise

    # ---------------------------------------------------------
    # Check model
    # ---------------------------------------------------------

    if not output_model.exists():

        raise FileNotFoundError(
            "Best model file was not created."
        )

    print("\n[+] Training finished successfully.")

    # ---------------------------------------------------------
    # Load best model
    # ---------------------------------------------------------

    print("\n[*] Loading best saved model...")

    model = tf.keras.models.load_model(
        str(output_model)
    )

    print("[+] Best model loaded successfully.")

    # ---------------------------------------------------------
    # Test evaluation
    # ---------------------------------------------------------

    print("\n[*] Evaluating model on test data...")

    results = model.evaluate(
        test_generator,
        verbose=1
    )

    print("\n" + "=" * 70)
    print(" TEST SET PERFORMANCE ")
    print("=" * 70)

    if len(results) >= 4:

        test_loss = results[0]
        test_accuracy = results[1]
        test_precision = results[2]
        test_recall = results[3]

        f1_score = (

            2 *
            test_precision *
            test_recall

        ) / (

            test_precision +
            test_recall +
            1e-7
        )

        print(
            f"Test Accuracy  : "
            f"{test_accuracy * 100:.2f}%"
        )

        print(
            f"Test Precision : "
            f"{test_precision * 100:.2f}%"
        )

        print(
            f"Test Recall    : "
            f"{test_recall * 100:.2f}%"
        )

        print(
            f"Test F1 Score  : "
            f"{f1_score * 100:.2f}%"
        )

        print(
            f"Test Loss      : "
            f"{test_loss:.4f}"
        )

    else:

        print(
            f"Test Results : {results}"
        )

    print("=" * 70)

    # ---------------------------------------------------------
    # Training graphs
    # ---------------------------------------------------------

    print("\n[*] Creating training graphs...")

    plot_training_history(

        history,

        str(training_graph)
    )

    # ---------------------------------------------------------
    # Copy model to backend
    # ---------------------------------------------------------

    print("\n[*] Copying trained model to backend...")

    backend_model_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    shutil.copy2(

        output_model,

        backend_model
    )

    print(
        f"[+] Model saved: "
        f"{output_model}"
    )

    print(
        f"[+] Backend model: "
        f"{backend_model}"
    )

    print(
        f"[+] Training graph: "
        f"{training_graph}"
    )

    print("\n" + "=" * 70)
    print(" TRAINING COMPLETED SUCCESSFULLY ")
    print("=" * 70)


if __name__ == "__main__":
    main()