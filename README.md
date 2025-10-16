# SwapStop

Clone the repository:
```git clone https://github.com/jeremyboyles/SwapStop.git SwapStop```
```Cd SwapStop```

Install dependencies:
```pip install -r requirements.txt```
or
```pip3 install -r requirements.txt```

Running the server:
Run the server using ```uvicorn app.main:app --reload```

Access the API:
```http://127.0.0.1:8000/docs```<br>



# SwapStop Frontend (React)


## Prerequisites

Before running the UI, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

Check installation with:

```bash
node -v
npm -v
```
To Run UI Element:
```bash
git clone <frontend-repo-url> frontend
cd frontend
npm install
npm run dev
```
Follow link: "http://localhost:5173"

## Running UI Tests

To run simple UI test, run the following command:

```bash
npm run test
```
This test starts the app in a test browser, looks at the header area and verifies it has the site’s brand name. Then, checks that the navigation bar has the three key buttons. The test fails if any of these elements are missing or mislabeled.