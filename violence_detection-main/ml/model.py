import tensorflow as tf

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import (
    Input,
    TimeDistributed,
    Conv2D,
    MaxPooling2D,
    GlobalAveragePooling2D,
    LSTM,
    Dense,
    Dropout
)
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.metrics import Precision, Recall


def build_cnn_lstm_model(
    sequence_length: int = 20,
    frame_size: int = 224,
    learning_rate: float = 1e-4
) -> Sequential:

    model = Sequential(
        [
            Input(
                shape=(
                    sequence_length,
                    frame_size,
                    frame_size,
                    3
                )
            ),

            TimeDistributed(
                Conv2D(
                    32,
                    (3, 3),
                    activation="relu",
                    padding="same"
                ),
                name="td_conv_1"
            ),

            TimeDistributed(
                MaxPooling2D((2, 2)),
                name="td_pool_1"
            ),

            TimeDistributed(
                Conv2D(
                    64,
                    (3, 3),
                    activation="relu",
                    padding="same"
                ),
                name="td_conv_2"
            ),

            TimeDistributed(
                MaxPooling2D((2, 2)),
                name="td_pool_2"
            ),

            TimeDistributed(
                GlobalAveragePooling2D(),
                name="td_global_pool"
            ),

            LSTM(
                64,
                return_sequences=False,
                name="lstm_temporal"
            ),

            Dense(
                128,
                activation="relu",
                name="dense_features"
            ),

            Dropout(
                0.5,
                name="dropout_regularization"
            ),

            Dense(
                1,
                activation="sigmoid",
                name="violence_probability"
            )
        ],
        name="CNN_LSTM_Violence_Detector"
    )

    optimizer = Adam(
        learning_rate=learning_rate
    )

    model.compile(
        optimizer=optimizer,
        loss="binary_crossentropy",
        metrics=[
            "accuracy",
            Precision(name="precision"),
            Recall(name="recall")
        ]
    )

    return model


def print_model_summary():

    model = build_cnn_lstm_model()

    model.summary()


if __name__ == "__main__":

    print(
        "[*] CNN-LSTM model architecture:"
    )

    print_model_summary()