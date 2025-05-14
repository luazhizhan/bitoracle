# BitOracle

The paper discusses the development of an Automated Bitcoin Trading decentralized application (dApp) that utilizes price predictions generated from advanced deep learning models, specifically Random Forest (RF), Long Short-Term Memory (LSTM), and Bi-directional LSTM (Bi-LSTM).

The model achieved an impressive 488.74% return on investment (ROI), significantly outperforming buy and hold strategy while ensuring transparency and automation throughout the trading process.

You can view the publication [here](https://doi.org/10.3390/risks13010017).

## Model Deployment

The model is deployed to Replicate using the Cog framework, allowing for efficient replication and execution.

## Firebase Integration

Firebase functions are utilized to trigger the model, facilitate on-chain trading, and store results in Firestore.

## Model Training

The RF, LSTM, and Bi-LSTM models are trained using the data provided in the `data` folder. The trained models are saved in the `model` folder for easy access and deployment.

## Web Interface

This repository includes the landing page associated with the paper.
