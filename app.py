from flask import Flask,request,jsonify,render_template
import pandas as pd
import joblib
model = joblib.load("heart_model_tuned.pkl")


app=Flask(__name__)

@app.route('/')
def home():
   return render_template("index.html")

@app.route('/predict',methods=['POST'])

def prediction():
    data=request.json
    print(data)
    input_df = pd.DataFrame([data])
    print(input_df)
    print("before predict")
    pred = model.predict(input_df)
    print("after predict")
    print(pred)
    return jsonify({
    "prediction": int(pred[0])
})






if __name__ == "__main__":
    app.run(debug=True)