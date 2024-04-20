import React from "react";
import styles from './index.module.css';
import { cn } from "@/lib/utils";

export function Spinner() {

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div className={styles['sk-fading-circle']}>
        <div className={cn(styles['sk-circle1'], styles['sk-circle'])} />
        <div className={cn(styles['sk-circle2'], styles['sk-circle'])} />
        <div className={cn(styles['sk-circle3'], styles['sk-circle'])} />
        <div className={cn(styles['sk-circle4'], styles['sk-circle'])} />
        <div className={cn(styles['sk-circle5'], styles['sk-circle'])} />
        <div className={cn(styles['sk-circle6'], styles['sk-circle'])} />
        <div className={cn(styles['sk-circle7'], styles['sk-circle'])} />
        <div className={cn(styles['sk-circle8'], styles['sk-circle'])} />
        <div className={cn(styles['sk-circle9'], styles['sk-circle'])} />
        <div className={cn(styles['sk-circle10'], styles['sk-circle'])} />
        <div className={cn(styles['sk-circle11'], styles['sk-circle'])} />
        <div className={cn(styles['sk-circle12'], styles['sk-circle'])} />
      </div>
    </div>
  );
}
