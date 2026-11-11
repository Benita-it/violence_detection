import os
import cv2
import math
import numpy as np
import tensorflow as tf

from sklearn.model_selection import train_test_split


VIDEO_EXTENSIONS = (".mp4", ".avi", ".mov", ".mkv")


def get_video_files(folder):
    if not os.path.exists(folder):
        return []

    files = []

    for file_name in os.listdir(folder):
        if file_name.lower().endswith(VIDEO_EXTENSIONS):
            files.append(os.path.join(folder, file_name))

    files.sort()

    return files


def split_video_dataset(
    dataset_dir="dataset",
    max_videos_per_class=300,
    random_state=42
):
    violence_dir = os.path.join(dataset_dir, "Violence")
    nonviolence_dir = os.path.join(dataset_dir, "NonViolence")

    violence_videos = get_video_files(violence_dir)
    nonviolence_videos = get_video_files(nonviolence_dir)

    print("\nDataset check:")
    print("Violence videos found:", len(violence_videos))
    print("NonViolence videos found:", len(nonviolence_videos))

    if len(violence_videos) == 0:
        raise ValueError("No videos found in dataset/Violence")

    if len(nonviolence_videos) == 0:
        raise ValueError("No videos found in dataset/NonViolence")

    if max_videos_per_class is not None:
        violence_videos = violence_videos[:max_videos_per_class]
        nonviolence_videos = nonviolence_videos[:max_videos_per_class]

    print("\nVideos selected:")
    print("Violence:", len(violence_videos))
    print("NonViolence:", len(nonviolence_videos))

    all_videos = violence_videos + nonviolence_videos

    all_labels = (
        [1] * len(violence_videos)
        + [0] * len(nonviolence_videos)
    )

    all_videos = np.array(all_videos)
    all_labels = np.array(all_labels)

    (
        train_videos,
        temp_videos,
        train_labels,
        temp_labels
    ) = train_test_split(
        all_videos,
        all_labels,
        test_size=0.30,
        random_state=random_state,
        stratify=all_labels
    )

    (
        val_videos,
        test_videos,
        val_labels,
        test_labels
    ) = train_test_split(
        temp_videos,
        temp_labels,
        test_size=0.50,
        random_state=random_state,
        stratify=temp_labels
    )

    print("\nVideo-level split:")
    print("Train:", len(train_videos))
    print("Validation:", len(val_videos))
    print("Test:", len(test_videos))

    return (
        train_videos,
        train_labels,
        val_videos,
        val_labels,
        test_videos,
        test_labels
    )


def extract_video_frames(
    video_path,
    frame_size=224,
    frame_skip=2,
    max_frames=None
):
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        print(f"Warning: Cannot open video: {video_path}")
        return []

    frames = []
    frame_index = 0

    while True:
        success, frame = cap.read()

        if not success:
            break

        if frame_index % frame_skip == 0:

            frame = cv2.resize(
                frame,
                (frame_size, frame_size)
            )

            frame = cv2.cvtColor(
                frame,
                cv2.COLOR_BGR2RGB
            )

            frame = frame.astype(
                np.float32
            ) / 255.0

            frames.append(frame)

            if max_frames is not None:
                if len(frames) >= max_frames:
                    break

        frame_index += 1

    cap.release()

    return frames


def build_sequences_from_frames(
    frames,
    sequence_length=20,
    sequence_stride=10
):
    if len(frames) == 0:
        return []

    sequences = []

    if len(frames) < sequence_length:

        padded_frames = list(frames)
        last_frame = frames[-1]

        while len(padded_frames) < sequence_length:
            padded_frames.append(last_frame)

        sequence = np.array(
            padded_frames,
            dtype=np.float32
        )

        sequences.append(sequence)

        return sequences

    start = 0

    while start + sequence_length <= len(frames):

        sequence = np.array(
            frames[
                start:start + sequence_length
            ],
            dtype=np.float32
        )

        sequences.append(sequence)

        start += sequence_stride

    if start < len(frames):

        remaining = frames[start:]

        if len(remaining) > 0:

            padded_frames = list(remaining)
            last_frame = frames[-1]

            while len(padded_frames) < sequence_length:
                padded_frames.append(last_frame)

            sequence = np.array(
                padded_frames,
                dtype=np.float32
            )

            sequences.append(sequence)

    return sequences


class ViolenceDataGenerator(tf.keras.utils.Sequence):

    def __init__(
        self,
        video_paths,
        labels,
        batch_size=2,
        sequence_length=20,
        frame_size=224,
        frame_skip=2,
        sequence_stride=10,
        shuffle=True,
        **kwargs
    ):

        super().__init__(**kwargs)

        self.video_paths = np.array(video_paths)
        self.labels = np.array(labels)

        self.batch_size = batch_size
        self.sequence_length = sequence_length
        self.frame_size = frame_size
        self.frame_skip = frame_skip
        self.sequence_stride = sequence_stride
        self.shuffle = shuffle

        self.indexes = np.arange(
            len(self.video_paths)
        )

        self.on_epoch_end()

    def __len__(self):

        return math.ceil(
            len(self.video_paths) /
            self.batch_size
        )

    def __getitem__(self, index):

        batch_indexes = self.indexes[
            index * self.batch_size:
            (index + 1) * self.batch_size
        ]

        batch_x = []
        batch_y = []

        for sample_index in batch_indexes:

            video_path = self.video_paths[
                sample_index
            ]

            label = self.labels[
                sample_index
            ]

            required_frames = (
                self.sequence_length
                * self.frame_skip
            )

            frames = extract_video_frames(
                video_path=video_path,
                frame_size=self.frame_size,
                frame_skip=self.frame_skip,
                max_frames=required_frames
            )

            sequences = build_sequences_from_frames(
                frames=frames,
                sequence_length=self.sequence_length,
                sequence_stride=self.sequence_stride
            )

            if len(sequences) == 0:

                print(
                    f"Warning: Could not create sequence for: "
                    f"{video_path}"
                )

                continue

            sequence = sequences[0]

            batch_x.append(sequence)
            batch_y.append(label)

        if len(batch_x) == 0:

            raise ValueError(
                "No valid video sequences were created "
                "for this batch."
            )

        batch_x = np.array(
            batch_x,
            dtype=np.float32
        )

        batch_y = np.array(
            batch_y,
            dtype=np.float32
        )

        return batch_x, batch_y

    def on_epoch_end(self):

        if self.shuffle:
            np.random.shuffle(self.indexes)


def create_generators(
    dataset_dir="dataset",
    max_videos_per_class=300,
    batch_size=2,
    sequence_length=20,
    frame_size=224,
    frame_skip=2,
    sequence_stride=10,
    random_state=42
):

    (
        train_videos,
        train_labels,
        val_videos,
        val_labels,
        test_videos,
        test_labels
    ) = split_video_dataset(
        dataset_dir=dataset_dir,
        max_videos_per_class=max_videos_per_class,
        random_state=random_state
    )

    train_generator = ViolenceDataGenerator(
        train_videos,
        train_labels,
        batch_size=batch_size,
        sequence_length=sequence_length,
        frame_size=frame_size,
        frame_skip=frame_skip,
        sequence_stride=sequence_stride,
        shuffle=True
    )

    val_generator = ViolenceDataGenerator(
        val_videos,
        val_labels,
        batch_size=batch_size,
        sequence_length=sequence_length,
        frame_size=frame_size,
        frame_skip=frame_skip,
        sequence_stride=sequence_stride,
        shuffle=False
    )

    test_generator = ViolenceDataGenerator(
        test_videos,
        test_labels,
        batch_size=batch_size,
        sequence_length=sequence_length,
        frame_size=frame_size,
        frame_skip=frame_skip,
        sequence_stride=sequence_stride,
        shuffle=False
    )

    print("\n[+] Generators created successfully.")

    return (
        train_generator,
        val_generator,
        test_generator
    )


def load_video_dataset(
    dataset_dir="dataset",
    sequence_length=20,
    frame_size=224,
    max_videos_per_class=300
):

    (
        train_videos,
        train_labels,
        val_videos,
        val_labels,
        test_videos,
        test_labels
    ) = split_video_dataset(
        dataset_dir=dataset_dir,
        max_videos_per_class=max_videos_per_class,
        random_state=42
    )

    all_videos = np.concatenate(
        [
            train_videos,
            val_videos,
            test_videos
        ]
    )

    all_labels = np.concatenate(
        [
            train_labels,
            val_labels,
            test_labels
        ]
    )

    all_sequences = []
    final_labels = []

    for video_path, label in zip(
        all_videos,
        all_labels
    ):

        frames = extract_video_frames(
            video_path,
            frame_size=frame_size,
            frame_skip=2
        )

        sequences = build_sequences_from_frames(
            frames,
            sequence_length=sequence_length,
            sequence_stride=10
        )

        for sequence in sequences:

            all_sequences.append(sequence)
            final_labels.append(label)

    if len(all_sequences) == 0:
        raise ValueError(
            "No video sequences could be created."
        )

    X = np.array(
        all_sequences,
        dtype=np.float32
    )

    y = np.array(
        final_labels,
        dtype=np.int32
    )

    return X, y


def get_train_val_test_splits(
    X,
    y,
    random_state=42
):

    (
        X_train,
        X_temp,
        y_train,
        y_temp
    ) = train_test_split(
        X,
        y,
        test_size=0.30,
        random_state=random_state,
        stratify=y
    )

    (
        X_val,
        X_test,
        y_val,
        y_test
    ) = train_test_split(
        X_temp,
        y_temp,
        test_size=0.50,
        random_state=random_state,
        stratify=y_temp
    )

    return (
        X_train,
        X_val,
        X_test,
        y_train,
        y_val,
        y_test
    )