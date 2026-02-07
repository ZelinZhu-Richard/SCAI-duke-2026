#!/usr/bin/env python3
"""Train a small text→intent classifier on prepared intent CSVs (text + intent)."""
import argparse
import json
import os

import pandas as pd
import torch
from sklearn.model_selection import train_test_split
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
from datasets import Dataset


def load_config(path):
    with open(path, "r") as f:
        return json.load(f)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", required=True)
    args = ap.parse_args()

    cfg = load_config(args.config)
    processed_dir = cfg["paths"]["processed_dir"]
    results_dir = cfg["paths"]["results_dir"]
    intent_cfg = cfg["intent"]
    label_set = intent_cfg["label_set"]
    max_length = intent_cfg.get("max_length", 128)
    epochs = intent_cfg.get("epochs", 3)
    batch_size = intent_cfg.get("batch_size", 8)
    seed = cfg.get("seed", 13)
    os.makedirs(results_dir, exist_ok=True)

    train_path = os.path.join(processed_dir, f"intent_{cfg['dataset']['split_train']}.csv")
    if not os.path.exists(train_path):
        print(f"Not found: {train_path}. Run prep_audio first.")
        return

    df = pd.read_csv(train_path)
    df = df[df["intent"].notna() & (df["intent"] != "")]
    if df.empty:
        print("No labeled intents in train CSV.")
        return

    id2label = {i: l for i, l in enumerate(label_set)}
    label2id = {l: i for i, l in enumerate(label_set)}
    df["label"] = df["intent"].map(label2id)
    df = df[df["label"].notna()]
    if df.empty:
        print("No intents in label_set.")
        return

    model_name = "distilbert-base-uncased"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(
        model_name, num_labels=len(label_set), id2label=id2label, label2id=label2id
    )

    def tokenize(ex):
        return tokenizer(
            ex["text"],
            truncation=True,
            max_length=max_length,
            padding="max_length",
        )

    train_df, eval_df = train_test_split(df, test_size=0.15, random_state=seed, stratify=df["label"])
    train_ds = Dataset.from_pandas(train_df[["text", "label"]])
    eval_ds = Dataset.from_pandas(eval_df[["text", "label"]])
    train_ds = train_ds.map(tokenize, batched=True, remove_columns=["text"])
    eval_ds = eval_ds.map(tokenize, batched=True, remove_columns=["text"])
    train_ds.set_format("torch")
    eval_ds.set_format("torch")

    out = os.path.join(results_dir, "intent_model")
    training_args = TrainingArguments(
        output_dir=out,
        num_train_epochs=epochs,
        per_device_train_batch_size=batch_size,
        per_device_eval_batch_size=batch_size,
        evaluation_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        seed=seed,
    )
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_ds,
        eval_dataset=eval_ds,
    )
    trainer.train()
    trainer.save_model(out)
    tokenizer.save_pretrained(out)
    print(f"Saved intent model to {out}")


if __name__ == "__main__":
    main()
