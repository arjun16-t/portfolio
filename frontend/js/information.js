// information.js
// Centralized data registry for portfolio content
const FEATURED_WORK = [
    {
        category: "AI Platform • 2026",
        title: "AthenaChat",
        description: "Architected a chatbot-as-a-service platform with isolated vector search using Qdrant payload filtering and SHA256-based deduplication.",
        metrics: ["Django REST", "Jina Embeddings", "Qdrant", "Groq", "Celery", "SPLADE"],
        link: "https://github.com/arjun16-t",
        image: "assets/images/athenachat-visual.jpg" // Add your image path here
    },
    {
        category: "Predictive Model • 2026",
        title: "NSE Stock Prediction Engine",
        description: "Built an end-to-end ML pipeline training GRU, LSTM, and Transformers on 55k sequences with FinBERT news sentiment fusion.",
        metrics: ["PyTorch", "FinBERT", "SHAP", "Streamlit", "Pandas-TA", "GRU / LSTM"],
        link: "https://github.com/arjun16-t",
        image: "assets/images/nse-visual.jpg" // Add your image path here
    },
    {
        category: "Distributed System • 2025",
        title: "HireMailer",
        description: "Architected a distributed three-service system enabling non-blocking bulk email operations processing 100+ emails/batch with zero spam flagging.",
        metrics: ["Python", "Django", "Celery", "Redis", "PostgreSQL"],
        link: "https://github.com/arjun16-t",
        image: "assets/images/hiremailer-visual.jpg" // Add your image path here
    }
];

const EXPERIMENTS_DATA = [
    {
        id: "PROJ_01",
        name: "AthenaChat: Chatbot-As-A-Service",
        type: "interactive",
        description: "Designed a chatbot-as-a-service platform with a Django REST backend, Qdrant vector store, and Groq-powered LLM inference, architected for multi-client deployment with isolated knowledge bases per tenant",
        logs: [
            "> python manage.py runserver",
            "> celery -A config worker --loglevel=info --concurrency=1",
            "[ INFO ] Loading Embedding Models...",
            "[ INFO ] Connecting to Qdrant Client...",
            "[ INFO ] Initializing RAG Pipeline...",
            "[ SUCCESS ] Logged in as Arjun and Fetched Documents",
            "[ OUTPUT ] Chatbot ready. Awaiting questions..."
        ],
        ui: `
            <div class="terminal-ui-block mt-4">
                <div class="input-group flex gap-2 mb-4">
                    <span class="text-brand-accent">> TICKER:</span>
                    <input type="text" id="stock-ticker" placeholder="e.g., RELIANCE" class="bg-transparent border-b border-[#333] text-white focus:outline-none focus:border-brand-accent uppercase w-48 font-mono">
                    <button id="run-stock-btn" class="border border-[#444] px-3 py-1 hover:bg-[#333] transition-colors">[ INFER ]</button>
                </div>
                <div id="stock-output" class="text-muted min-h-[50px]"></div>
            </div>
        `
    },
    {
        id: "PROJ_02",
        name: "HANDWRITING GENERATION",
        type: "interactive",
        description: "Replicating human typeface using the IAM-OnDB dataset.",
        logs: [
            "> ./load_dataset.sh IAM-OnDB",
            "[ INFO ] Parsing XML stroke data...",
            "[ INFO ] Mapping spatial coordinates to human typeface...",
            "[ SUCCESS ] Vector models loaded.",
            "[ OUTPUT ] Awaiting text input for generation..."
        ],
        ui: `
            <div class="terminal-ui-block mt-4">
                <div class="input-group flex flex-col gap-3 mb-4">
                    <span class="text-brand-accent">> ENTER TEXT TO RENDER:</span>
                    <div class="flex gap-2">
                        <input type="text" id="hw-input" placeholder="Type a word..." class="bg-transparent border-b border-[#333] text-white focus:outline-none focus:border-brand-accent flex-grow font-mono">
                        <button id="run-hw-btn" class="border border-[#444] px-3 py-1 hover:bg-[#333] transition-colors">[ GENERATE ]</button>
                    </div>
                </div>
                <div id="hw-output" class="min-h-[100px] border border-[#333] flex items-center justify-center text-muted">
                    IMAGE_OUTPUT_CANVAS
                </div>
            </div>
        `
    },
    {
        id: "EXP_03",
        name: "REAL-TIME DDOS PROFILER",
        type: "simulation",
        description: "SIH winning AI-backed threat detection system.",
        logs: [
            "> systemctl start ddos_profiler",
            "[ INFO ] Establishing baseline traffic heuristics...",
            "[ WARN ] Anomaly detected on port 443.",
            "[ SECURE ] Malicious IP isolated and dropped.",
            "[ SUCCESS ] Threat mitigated in 14ms."
        ],
        ui: null
    },
    {
        id: "EXP_04",
        name: "HYBRID MOVIE RECOMMENDER",
        type: "interactive",
        description: "Content-based and collaborative filtering recommendation engine.",
        logs: [
            "> python serve_recommender.py --mode hybrid",
            "[ INFO ] Loading user-item interaction matrix...",
            "[ INFO ] Computing cosine similarity vectors...",
            "[ SUCCESS ] API endpoint active.",
            "[ OUTPUT ] Query engine ready."
        ],
        ui: `
            <div class="terminal-ui-block mt-4">
                <div class="input-group flex gap-2 mb-4">
                    <span class="text-brand-accent">> MOVIE ID/TITLE:</span>
                    <input type="text" id="movie-input" placeholder="Search..." class="bg-transparent border-b border-[#333] text-white focus:outline-none focus:border-brand-accent w-48 font-mono">
                    <button id="run-movie-btn" class="border border-[#444] px-3 py-1 hover:bg-[#333] transition-colors">[ FIND ]</button>
                </div>
                <div id="movie-output" class="text-muted grid grid-cols-1 gap-2 min-h-[50px]"></div>
            </div>
        `
    },
    {
        id: "EXP_05",
        name: "MEDICAL PREMIUM PREDICTOR",
        type: "simulation",
        description: "XGBRegressor model with categorical encoding for insurance forecasting.",
        logs: [
            "> jupyter nbconvert --execute model_train.ipynb",
            "[ INFO ] Applying categorical encoding to features...",
            "[ INFO ] Optimizing XGBRegressor hyperparameters...",
            "[ SUCCESS ] Cross-validation R2 score: 0.89",
            "[ OUTPUT ] Final weight matrices serialized and exported."
        ],
        ui: null
    }
];

const TOOLKIT_DATA = [
    // LANGUAGES
    {
        category: "LANGUAGES",
        name: "Python",
        role: "Core ML & Backend",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg"
    },
    {
        category: "LANGUAGES",
        name: "C++",
        role: "DSA & Systems",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg"
    },
    {
        category: "LANGUAGES",
        name: "C",
        role: "DSA",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/c/c-original.svg"
    },
    {
        category: "LANGUAGES",
        name: "Java",
        role: "Algorithms",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg"
    },
    {
        category: "LANGUAGES",
        name: "JavaScript",
        role: "Frontend & Web Dev",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg"
    },
    // ML & AI
    {
        category: "AI / ML",
        name: "PyTorch",
        role: "Deep Learning",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/pytorch/pytorch-original.svg"
    },
    {
        category: "AI / ML",
        name: "Tensorflow",
        role: "Deep Learning - Research",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tensorflow/tensorflow-original.svg"
    },
    {
        category: "AI / ML",
        name: "Scikit-Learn",
        role: "Machine Learning",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/scikitlearn/scikitlearn-original.svg"
    },
    {
        category: "AI / ML",
        name: "Jupyter",
        role: "Data Exploration",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/jupyter/jupyter-original.svg"
    },
    {
        category: "AI / ML",
        name: "Google Colab",
        role: "Model Training",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/googlecolab/googlecolab-original.svg"
    },
    {
        category: "AI / ML",
        name: "LangChain",
        role: "Data Exploration",
        logo: "./assets/images/icons/langchain.svg"
    },
    {
        category: "AI / ML",
        name: "Hugging Face",
        role: "Transformers",
        logo: "./assets/images/icons/huggingface.svg"
    },
    // BACKEND & SYSTEMS
    {
        category: "BACKEND",
        name: "Django",
        role: "API Architecture",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/django/django-plain.svg"
    },
    {
        category: "BACKEND",
        name: "Django Rest Framework",
        role: "RESTful API",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/djangorest/djangorest-plain.svg"
    },
    {
        category: "BACKEND",
        name: "FastAPI",
        role: "Model Deployment",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-plain.svg"
    },
    {
        category: "BACKEND",
        name: "Redis",
        role: "Caching & Queues",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/redis/redis-original.svg"
    },
    {
        category: "BACKEND",
        name: "PostgreSQL",
        role: "Relational Database",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg"
    },
    {
        category: "BACKEND",
        name: "Git",
        role: "Version Management",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg"
    },
    {
        category: "BACKEND",
        name: "GitHub",
        role: "Version Management System",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg"
    },
    {
        category: "BACKEND",
        name: "Postman",
        role: "API Testing",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postman/postman-original.svg"
    },
    // FRONTEND
    {
        category: "FRONTEND",
        name: "Netlify",
        role: "Static Deployment",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/netlify/netlify-original.svg"
    },
    {
        category: "FRONTEND",
        name: "Railway",
        role: "CI/CD & Deployment",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/railway/railway-original.svg"
    },
    {
        category: "FRONTEND",
        name: "Streamlit",
        role: "Data Applications",
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/streamlit/streamlit-original.svg"
    }
];

// Add these to information.js

const EXPERIENCE_DATA = [
    {
        role: "Freelancer",
        company: "Freelancer",
        date: "May 2025 - Present",
        description: [
            "Deployed website using HTML/CSS/Vanilla JS for client",
            "Developed and deployed a scalable RAG application using Django and Qdrant.",
        ]
    },
];

const CREDENTIALS_DATA = [
    {
        date: "2026",
        title: "Introduction to PyTorch",
        issuer: "IBM",
        link: "./assets/images/certificates/pytorch.pdf"
    },
    {
        date: "2025",
        title: "Introduction to Neural Network with TensorFlow & Keras",
        issuer: "IBM",
        link: "./assets/images/certificates/keras.pdf"
    },
    {
        date: "2025",
        title: "RH104 - Getting Started with Linux",
        issuer: "RedHat",
        link: "./assets/images/certificates/rh104-linux.pdf"
    },
    {
        date: "2025",
        title: "Fundamentals of MCP",
        issuer: "HuggingFace",
        link: "./assets/images/certificates/mcp.webp"
    },
    {
        date: "2025",
        title: "Retrieval Augmented Generation",
        issuer: "DeepLearning.AI",
        link: "./assets/images/certificates/rag.pdf"
    }, 
    {
        date: "2025",
        title: "Vector Databases",
        issuer: "IBM",
        link: "./assets/images/certificates/vectordb.pdf"
    }, 
    {
        date: "2025",
        title: "Django Web Framework",
        issuer: "Meta",
        link: "./assets/images/certificates/django.pdf"
    },
    {
        date: "2025",
        title: "Introduction to Java",
        issuer: "University of Penn",
        link: "./assets/images/certificates/java.pdf"
    },
    {
        date: "2024",
        title: "C++ Programming",
        issuer: "Udemy",
        link: "./assets/images/certificates/cplusplus.jpg"
    },
];