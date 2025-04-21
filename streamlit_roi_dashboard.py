
import streamlit as st
import json

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
    # Sample data - this would normally come from your prediction system
    strategy = "lux_strategy_v2"
    context = "Volatility High + FED tightening"
    prediction_data = {
        "projected_ROI": "13.2%",
        "risk_score": 4,
        "recommended_next_move": "Increase tech ETF exposure"
    }
    
    load_prediction(strategy, context, prediction_data)
