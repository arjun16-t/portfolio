const EXPERIMENTS_DATA = [
    {
        id: "EXP_01",
        name: "TRANSFORMER STOCK PREDICTOR",
        description: "LSTM, GRU, and Transformer models for Indian market prediction.",
        logs: [
            "> python run_predictor.py --model transformer --target NSE",
            "[ INFO ] Loading historical tick data...",
            "[ INFO ] Initializing multi-head attention blocks...",
            "[ SUCCESS ] Model converged. MSE: 0.042",
            "[ OUTPUT ] Predictor ready for live socket connection."
        ]
    },
    {
        id: "EXP_02",
        name: "HANDWRITING GENERATION",
        description: "Replicating human typeface using the IAM-OnDB dataset.",
        logs: [
            "> ./load_dataset.sh IAM-OnDB",
            "[ INFO ] Parsing XML stroke data...",
            "[ INFO ] Mapping spatial coordinates to human typeface...",
            "[ SUCCESS ] Handwriting generation vector output nominal.",
            "[ OUTPUT ] View generated samples [↗]"
        ]
    },
    {
        id: "EXP_03",
        name: "REAL-TIME DDOS PROFILER",
        description: "SIH winning AI-backed threat detection system.",
        logs: [
            "> systemctl start ddos_profiler",
            "[ INFO ] Establishing baseline traffic heuristics...",
            "[ WARN ] Anomaly detected on port 443.",
            "[ SECURE ] Malicious IP isolated and dropped.",
            "[ SUCCESS ] Threat mitigated in 14ms."
        ]
    },
    {
        id: "EXP_04",
        name: "HYBRID MOVIE RECOMMENDER",
        description: "Content-based and collaborative filtering recommendation engine.",
        logs: [
            "> python serve_recommender.py --mode hybrid",
            "[ INFO ] Loading user-item interaction matrix...",
            "[ INFO ] Computing cosine similarity vectors...",
            "[ SUCCESS ] API endpoint active on port 8080.",
            "[ OUTPUT ] Top-K recommendations ready."
        ]
    },
    {
        id: "EXP_05",
        name: "MEDICAL PREMIUM PREDICTOR",
        description: "XGBRegressor model with categorical encoding for insurance forecasting.",
        logs: [
            "> jupyter nbconvert --execute model_train.ipynb",
            "[ INFO ] Applying categorical encoding to features...",
            "[ INFO ] Optimizing XGBRegressor hyperparameters...",
            "[ SUCCESS ] Cross-validation R2 score: 0.89",
            "[ OUTPUT ] Feature importance graph generated."
        ]
    }
];