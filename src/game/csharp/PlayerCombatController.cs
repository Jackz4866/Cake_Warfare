using System;
using System.Collections.Generic;
using UnityEngine; // ou Godot C#

namespace CakeWarfare
{
    public enum Team { Outlaws, Medics }
    public enum WeaponType { Natural, Rocket, Knife }

    [Serializable]
    public class WeaponData
    {
        public WeaponType Type;
        public string Name;
        public float Damage;
        public float Cooldown;
        public float Range;
        public bool IsMelee;
        public float SplashRadius;
    }

    public class PlayerCombatController : MonoBehaviour
    {
        [Header("Configurações de Time")]
        public Team PlayerTeam = Team.Outlaws;
        public WeaponType CurrentWeapon = WeaponType.Natural;

        [Header("Status")]
        public float WeaponCooldown = 0f;
        public float CandleBuffTimer = 0f;
        public bool IsCaptured = false;
        public float Stamina = 100f;

        public static readonly Dictionary<WeaponType, WeaponData> Weapons = new()
        {
            { WeaponType.Natural, new WeaponData { Type = WeaponType.Natural, Name = "Bolo Natural", Damage = 15f, Cooldown = 0.22f, Range = 38f, IsMelee = false, SplashRadius = 1.0f } },
            { WeaponType.Rocket, new WeaponData { Type = WeaponType.Rocket, Name = "Bolo-Foguete", Damage = 75f, Cooldown = 1.8f, Range = 50f, IsMelee = false, SplashRadius = 5.5f } },
            { WeaponType.Knife, new WeaponData { Type = WeaponType.Knife, Name = "Bolo-Faca", Damage = 120f, Cooldown = 0.65f, Range = 3.2f, IsMelee = true, SplashRadius = 2.2f } }
        };

        private void Update()
        {
            if (IsCaptured) return;

            if (WeaponCooldown > 0f) WeaponCooldown -= Time.deltaTime;
            if (CandleBuffTimer > 0f) CandleBuffTimer -= Time.deltaTime;

            if (PlayerTeam == Team.Outlaws)
            {
                if (Input.GetKeyDown(KeyCode.Alpha1)) CurrentWeapon = WeaponType.Natural;
                if (Input.GetKeyDown(KeyCode.Alpha2)) CurrentWeapon = WeaponType.Rocket;
                if (Input.GetKeyDown(KeyCode.Alpha3)) CurrentWeapon = WeaponType.Knife;

                if (Input.GetMouseButtonDown(0) && WeaponCooldown <= 0f)
                {
                    ExecuteAttack();
                }
            }
        }

        private void ExecuteAttack()
        {
            var weapon = Weapons[CurrentWeapon];
            WeaponCooldown = weapon.Cooldown;

            if (weapon.IsMelee)
            {
                // Golpe com faca de bolo em NPCs próximos
            }
            else
            {
                // Disparo de projétil balístico ou foguete de bolo
            }
        }
    }
}
