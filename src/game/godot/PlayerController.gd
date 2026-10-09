class_name PlayerController
extends CharacterBody3D

# Cake Warfare - Script de Jogador (Godot 4 GDScript 3D)

enum Team { OUTLAWS, MEDICS }
enum WeaponType { NATURAL, ROCKET, KNIFE }

@export var team: Team = Team.OUTLAWS
@export var speed: float = 11.5
@export var sprint_multiplier: float = 1.6
@export var is_human: bool = true

var current_weapon: WeaponType = WeaponType.NATURAL
var weapon_cooldown: float = 0.0
var candle_buff_timer: float = 0.0
var is_captured: bool = false
var stamina: float = 100.0

@onready var visual_model: Node3D = $VisualModel

func _physics_process(delta: float) -> void:
	if is_captured:
		velocity = Vector3.ZERO
		move_and_slide()
		return

	if weapon_cooldown > 0.0:
		weapon_cooldown -= delta
	if candle_buff_timer > 0.0:
		candle_buff_timer -= delta

	if is_human:
		handle_human_movement(delta)
		handle_weapon_input()
	
	move_and_slide()

func handle_human_movement(delta: float) -> void:
	var input_dir := Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
	var dir := Vector3(input_dir.x, 0, input_dir.y).normalized()
	
	var current_speed = speed
	if Input.is_key_pressed(KEY_SHIFT) and team == Team.MEDICS and stamina > 0.0:
		current_speed *= sprint_multiplier
		stamina = max(0.0, stamina - 25.0 * delta)
	elif team == Team.MEDICS:
		stamina = min(100.0, stamina + 15.0 * delta)

	if dir != Vector3.ZERO:
		velocity.x = dir.x * current_speed
		velocity.z = dir.z * current_speed
		look_at(global_position + dir, Vector3.UP)
	else:
		velocity.x = move_toward(velocity.x, 0, current_speed)
		velocity.z = move_toward(velocity.z, 0, current_speed)

func handle_weapon_input() -> void:
	if team != Team.OUTLAWS:
		return
		
	if Input.is_key_pressed(KEY_1):
		current_weapon = WeaponType.NATURAL
	elif Input.is_key_pressed(KEY_2):
		current_weapon = WeaponType.ROCKET
	elif Input.is_key_pressed(KEY_3):
		current_weapon = WeaponType.KNIFE

	if Input.is_action_just_pressed("fire") and weapon_cooldown <= 0.0:
		fire_cake()

func fire_cake() -> void:
	match current_weapon:
		WeaponType.NATURAL:
			weapon_cooldown = 0.22
			# Instancia projétil bolo cupcake
		WeaponType.ROCKET:
			weapon_cooldown = 1.8
			# Instancia bolo foguete gigante
		WeaponType.KNIFE:
			weapon_cooldown = 0.65
			# Realiza golpe corpo a corpo
