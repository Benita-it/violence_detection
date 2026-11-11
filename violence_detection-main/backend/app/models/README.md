# Model Directory

Place your trained Keras / TensorFlow model file here:

`violence_model.h5`

### Generating the Model
To train the model on your dataset (e.g. Real Life Violence Situations or Hockey Fight Dataset), run:
```bash
python ml/train.py --data_dir /path/to/dataset --epochs 30 --batch_size 8
```
The training script will automatically save the best model weights as `violence_model.h5` and copy or link it directly into this directory.

If `violence_model.h5` is not yet present when starting the backend server, the API gracefully falls back to the architectural baseline so the full-stack system can be demonstrated without crashing.
