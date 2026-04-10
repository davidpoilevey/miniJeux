import React from "react";

export const Roots = ({ length }) => {
  // Composant représentant les racines de la plante
  // Utilisez des éléments graphiques pour dessiner les racines
  return (
    <div
      style={{
        width: '10px',
        height: `${length}px`,
        backgroundColor: 'brown',
      }} />
  );
};
export const Trunk = ({ height }) => {
  // Composant représentant le tronc principal de la plante
  return (
    <div
      style={{
        width: '20px',
        height: `${height}px`,
        backgroundColor: 'brown',
      }} />
  );
};
export const Branch = ({ length }) => {
  // Composant représentant une branche de la plante
  return (
    <div
      style={{
        width: '15px',
        height: `${length}px`,
        backgroundColor: 'brown',
      }} />
  );
};
export const Leaf = ({ feuille }) => {
  // Composant représentant une feuille de la plante
  return (
    <div
      style={{
        width: '10px',
        height: '10px',
        backgroundColor: feuille.color,
        borderRadius: '50%',
      }} />
  );
};
export const Flower = ({ fleur }) => {
  // Composant représentant une feuille de la plante
  return (
    <div
      style={{
        width: '10px',
        height: '10px',
        backgroundColor: fleur.color,
        borderRadius: '50%',
      }} />
  );
};
export const Fruit = ({ fruit }) => {
  // Composant représentant une feuille de la plante
  return (
    <div
      style={{
        width: '10px',
        height: '10px',
        backgroundColor: fruit.color,
        borderRadius: '50%',
      }} />
  );
};
export const Bud = ({ color }) => {
  // Composant représentant une feuille de la plante
  return (
    <div
      style={{
        width: '10px',
        height: '10px',
        backgroundColor: color,
        borderRadius: '50%',
      }} />
  );
};
