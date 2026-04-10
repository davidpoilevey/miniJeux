import React from 'react';
import { Group, Rect, Circle, Image } from 'react-konva';

function Player({ player, equippedWeapon, equippedArmor, weaponImage, armorImage, isAttacking }) {
  return (
    <Group x={player.x} y={player.y}>
      {/* Corps */}
      <Rect
        x={0}
        y={10}
        width={30}
        height={40}
        fill={player.isDead ? '#555' : '#3498db'}
        cornerRadius={5}
      />
      
      {/* Tête */}
      <Circle
        x={15}
        y={10}
        radius={10}
        fill={player.isDead ? '#333' : '#2ecc71'}
      />

      {/* Cape (indicateur de direction) */}
      <Rect
        x={player.direction === 'right' ? 25 : -10}
        y={15}
        width={10}
        height={30}
        fill={player.isDead ? '#444' : '#e74c3c'}
        cornerRadius={3}
      />

      {/* Badge armure (sur le torse) */}
      {equippedArmor && (
        <Group x={8} y={20}>
          <Circle radius={8} fill="rgba(0,0,0,0.5)" />
          {armorImage ? (
            <Image
              x={-6}
              y={-6}
              width={12}
              height={12}
              image={armorImage}
            />
          ) : (
            <Rect x={-4} y={-4} width={8} height={8} fill="#95a5a6" />
          )}
        </Group>
      )}

      {/* Badge arme (à côté du personnage) */}
      {equippedWeapon && !isAttacking && (
        <Group x={player.direction === 'right' ? 22 : 8} y={30}>
          <Circle radius={8} fill="rgba(0,0,0,0.5)" />
          {weaponImage ? (
            <Image
              x={-6}
              y={-6}
              width={12}
              height={12}
              image={weaponImage}
            />
          ) : (
            <Rect x={-4} y={-4} width={8} height={8} fill="#e67e22" />
          )}
        </Group>
      )}

      {/* Effet d'attaque (swoosh) */}
      {isAttacking && equippedWeapon && (
        <Group>
          {/* Arc de cercle pour le coup */}
         <Rect
      x={player.direction === 'right' ? 30 : -(equippedWeapon.range || 50)}
      y={25}
      width={equippedWeapon.range || 50}
      height={3}
      fill="#ecf0f1"
      shadowColor="#fff"
      shadowBlur={10}
      opacity={0.9}
    />
    {/* Pointe brillante */}
    <Circle
      x={player.direction === 'right' ? 30 + (equippedWeapon.range || 50) : -(equippedWeapon.range || 50)}
      y={26}
      radius={5}
      fill="#fff"
      shadowColor="#fff"
      shadowBlur={15}
    />
        </Group>
      )}

      {/* Barre de vie */}
      <Rect
        x={-5}
        y={-10}
        width={40}
        height={4}
        fill="#333"
        cornerRadius={2}
      />
      <Rect
        x={-5}
        y={-10}
        width={40 * (player.health / player.maxHealth)}
        height={4}
        fill={
          player.health / player.maxHealth > 0.5
            ? '#2ecc71'
            : player.health / player.maxHealth > 0.25
            ? '#f39c12'
            : '#e74c3c'
        }
        cornerRadius={2}
      />

      {/* Barre de mana */}
      <Rect
        x={-5}
        y={-5}
        width={40}
        height={3}
        fill="#222"
        cornerRadius={2}
      />
      <Rect
        x={-5}
        y={-5}
        width={40 * (player.mana / player.maxMana)}
        height={3}
        fill="#3498db"
        cornerRadius={2}
      />
    </Group>
  );
}

export default Player;