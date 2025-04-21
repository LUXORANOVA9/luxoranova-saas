
import json
import os
import streamlit as st

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    FIREBASE_AVAILABLE = True
except ModuleNotFoundError:
    print("⚠️ 'firebase_admin' module not found. Firebase features will be disabled.")
    FIREBASE_AVAILABLE = False

# Firebase Setup
db = None
if FIREBASE_AVAILABLE:
    service_account = os.getenv("FIREBASE_SERVICE_ACCOUNT")
    if service_account:
        try:
            cred_data = json.loads(service_account)
            cred = credentials.Certificate(cred_data)
            firebase_admin.initialize_app(cred)
            db = firestore.client()
        except Exception as e:
            st.error(f"⚠️ Failed to parse FIREBASE_SERVICE_ACCOUNT JSON: {e}")
            FIREBASE_AVAILABLE = False
    else:
        st.warning("⚠️ FIREBASE_SERVICE_ACCOUNT not found in environment.")
        FIREBASE_AVAILABLE = False

def load_prediction_from_firebase():
    if not db:
        return None
    
    try:
        # Get latest prediction from Firebase
        predictions = db.collection("lux_predictions").order_by(
            "timestamp", direction=firestore.Query.DESCENDING
        ).limit(1).stream()
        
        for doc in predictions:
            data = doc.to_dict()
            return {
                "strategy": data.get("strategy", "lux_strategy_v2"),
                "context": data.get("context", "No context available"),
                "prediction_data": {
                    "projected_ROI": data.get("projected_ROI", "0%"),
                    "risk_score": data.get("risk_score", 0),
                    "recommended_next_move": data.get("recommended_next_move", "No recommendation")
                }
            }
    except Exception as e:
        st.error(f"Error fetching data from Firebase: {e}")
        return None

def load_prediction(strategy, context, prediction_data):
    st.title("Investment Strategy ROI Dashboard")
    
    # Display strategy info
    st.header("Strategy Details")
    st.write(f"**Strategy:** {strategy}")
    st.write(f"**Context:** {context}")
    
    # Display metrics
    st.header("Prediction Metrics")
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric("Projected ROI", prediction_data["projected_ROI"])
    with col2:
        st.metric("Risk Score", prediction_data["risk_score"])
    with col3:
        st.write("**Recommended Move:**")
        st.write(prediction_data["recommended_next_move"])

if __name__ == "__main__":
    # Try to load from Firebase first
    firebase_data = load_prediction_from_firebase()
    
    if firebase_data:
        load_prediction(
            firebase_data["strategy"],
            firebase_data["context"],
            firebase_data["prediction_data"]
        )
    else:
        # Fallback to sample data
        strategy = "lux_strategy_v2"
        context = "Volatility High + FED tightening"
        prediction_data = {
            "projected_ROI": "13.2%",
            "risk_score": 4,
            "recommended_next_move": "Increase tech ETF exposure"
        }
        load_prediction(strategy, context, prediction_data)
