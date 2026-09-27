import { _decorator, Component, Node, RigidBody2D, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerMovementSystem')
export class PlayerMovementSystem extends Component {

    @property
    public speed: number = 10

    private rigidbody: RigidBody2D | null = null;

    protected onLoad(): void {
        this.rigidbody = this.getComponent(RigidBody2D);
    }

    public updateRotation(angleDegrees: number): void { }
    public updateMovement(moveDir: Vec2): void { 
        if (!this.rigidbody) return

        let currentVelocity = new Vec2
        Vec2.multiplyScalar (currentVelocity, moveDir, this.speed)

        this.rigidbody.linearVelocity = currentVelocity;
    }
}


