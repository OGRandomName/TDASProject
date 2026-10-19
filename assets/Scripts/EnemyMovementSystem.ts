import { _decorator, Component, Graphics, isValid, math, Node, RigidBody2D, Vec2 } from 'cc';
import { MovementConfig } from './EnemyConfig';
import { TacticalSteeringBehavior } from './TacticalSteeringBehavior';
import { AvoidBehavior } from './AvoidBehavior';
import { Enemy } from './Enemy';
import { EventBus, GameEvents } from './EventBus';

const { ccclass, property } = _decorator;

export interface NeighborData {
    position: Vec2;
    velocity: Vec2;
}

@ccclass('EnemyMovementSystem')
export class EnemyMovementSystem extends Component {

    @property({ type: Graphics })
    public debugGraphics: Graphics | null = null;

    private maxSpeed = 0;
    private maxTurnForce = 0;
    private tacticalSteering: TacticalSteeringBehavior | null = null;
    private rigidBody: RigidBody2D | null = null;
    private sharedActiveEnemies: Enemy[] = [];

    protected onLoad(): void {
        this.rigidBody = this.getComponent(RigidBody2D);
        this.debugGraphics = this.getComponent(Graphics);
        EventBus.on(GameEvents.WAVE_SPAWNED, this.receiveEnemyArray, this);
    }

    public init(maxSpeed: number, movementConfig: MovementConfig) {
        this.maxSpeed = maxSpeed;
        this.maxTurnForce = movementConfig.maxTurnForce;
        this.tacticalSteering = new TacticalSteeringBehavior(
            movementConfig,
            this,
            new AvoidBehavior(this, movementConfig.whiskers)
        );
    }

    public updateRotation(angleDegrees: number | null) {
        if (angleDegrees !== null) {
            this.node.angle = angleDegrees;
        } else {
            const currentVelocity = this.getVelocity();
            if (currentVelocity.lengthSqr() > 0.01) {
                this.node.angle = math.toDegree(Math.atan2(currentVelocity.y, currentVelocity.x));
            }
        }
    }

    public getVelocity(): Vec2 {
        return this.rigidBody ? this.rigidBody.linearVelocity.clone() : new Vec2();
    }

    public updateMovement(moveDir: Vec2) {
        if (!this.rigidBody || !this.tacticalSteering) return;

        let currentVelocity = this.getVelocity();
        const currentPosition = new Vec2(this.node.worldPosition.x, this.node.worldPosition.y);

        const tacticalAdjustments = this.tacticalSteering.getDesiredVelocity(currentPosition);

        const combinedForces = new Vec2();
        Vec2.add(combinedForces, tacticalAdjustments, moveDir);
        if (combinedForces.lengthSqr() > 1.0) {
            combinedForces.normalize();
        }

        const desiredVelocity = new Vec2();
        Vec2.multiplyScalar(desiredVelocity, combinedForces, this.maxSpeed);

        let steeringForce = new Vec2();
        Vec2.subtract(steeringForce, desiredVelocity, currentVelocity);
        steeringForce = this.clampForce(steeringForce, this.maxTurnForce);

        currentVelocity.add(steeringForce);
        currentVelocity = this.clampForce(currentVelocity, this.maxSpeed);

        this.rigidBody.linearVelocity = currentVelocity;
    }

    private clampForce(force: Vec2, maxForce: number): Vec2 {
        if (force.lengthSqr() > maxForce * maxForce) {
            force.normalize().multiplyScalar(maxForce);
        }
        return force;
    }

    public isMovingSlowly(): boolean {
        if (!this.rigidBody) return true;
        return this.rigidBody.linearVelocity.lengthSqr() < 10;
    }

    private receiveEnemyArray(masterArray: Enemy[]) {
        this.sharedActiveEnemies = masterArray;
    }

    public getNeighborData(): NeighborData[] {
        const neighbors: NeighborData[] = [];

        if (!this.sharedActiveEnemies || this.sharedActiveEnemies.length === 0) return neighbors;

        for (const otherEnemy of this.sharedActiveEnemies) {
            if (!isValid(otherEnemy) || !otherEnemy.node || otherEnemy.node === this.node) continue;

            const otherMovement = otherEnemy.getComponent(EnemyMovementSystem);
            if (!otherMovement) continue;

            neighbors.push({
                position: new Vec2(
                    otherEnemy.node.worldPosition.x,
                    otherEnemy.node.worldPosition.y
                ),
                velocity: otherMovement.getVelocity()
            });
        }
        return neighbors;
    }

    protected onDestroy(): void {
        EventBus.off(GameEvents.WAVE_SPAWNED, this.receiveEnemyArray, this);
    }
}
