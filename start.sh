#!/bin/bash

source venv/bin/activate

./backend/manage.py runserver &

cd frontend
npm install
npm run dev
