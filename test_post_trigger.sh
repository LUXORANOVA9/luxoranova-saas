
#!/bin/bash

curl -X POST http://0.0.0.0:5000/luxora-trigger \
  -H "Content-Type: application/json" \
  -d '{
    "strategy": "CrownMomentum", 
    "context": "VIX up 10% today",
    "prediction": {
      "roi": "14.6%",
      "risk": 5,
      "recommended_move": "Rotate out of small caps"
    }
  }'
