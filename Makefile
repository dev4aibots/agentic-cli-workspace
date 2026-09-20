setup:
	python -m venv venv
	venv/bin/pip install -r requirements.txt

test:
	venv/bin/python -m unittest discover tests

run:
	npm run dev

eval:
	venv/bin/python evals/run_eval.py
