import { _decorator, Camera, Component, EventKeyboard, EventMouse, KeyCode, log, Node, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerInputSystem')
export class PlayerInputSystem extends Component {

    public isShooting: boolean = false;

    private isUp: boolean = false;
    private isDown: boolean = false;
    private isLeft: boolean = false;
    private isRight: boolean = false;

    private moveDir: Vec2 = new Vec2();

    public handleKeyDown(event: EventKeyboard): void { 
        switch (event.keyCode) {
            case KeyCode.KEY_W:
            case KeyCode.ARROW_UP:
                this.isUp = true;
                log("Input System: Up key pressed");
                break;
            case KeyCode.KEY_S:
            case KeyCode.ARROW_DOWN:
                this.isDown = true;
                log("Input System: Down key pressed");
                break;
            case KeyCode.KEY_A:
            case KeyCode.ARROW_LEFT:
                this.isLeft = true;
                log("Input System: Left key pressed");
                break;
            case KeyCode.KEY_D:
            case KeyCode.ARROW_RIGHT:
                this.isRight = true;
                log("Input System: Right key pressed");
                break;
        }
    }
    public handleKeyUp(event: EventKeyboard): void { 
        switch (event.keyCode) {
            case KeyCode.KEY_W:
            case KeyCode.ARROW_UP:
                this.isUp = false;
                log("Input System: Up key released");
                break;
            case KeyCode.KEY_S:
            case KeyCode.ARROW_DOWN:
                this.isDown = false;
                log("Input System: Down key released");
                break;
            case KeyCode.KEY_A:
            case KeyCode.ARROW_LEFT:
                this.isLeft = false;
                log("Input System: Left key released");
                break;
            case KeyCode.KEY_D:
            case KeyCode.ARROW_RIGHT:
                this.isRight = false;
                log("Input System: Right key released");
                break;
        }
    }
    public handleMouseDown(event: EventMouse): void { 
        if (event.getButton() === 0) { // Left mouse button
            this.isShooting = true;
            log("Input System: Mouse button pressed");
        }
    }
    public handleMouseUp(event: EventMouse): void { 
        if (event.getButton() === 0) { // Left mouse button
            this.isShooting = false;
            log("Input System: Mouse button released");
        }
    }
    public handleMouseMove(event: EventMouse): void { }

    public getMoveDirection(): Vec2 {
        this.moveDir.x = (this.isRight ? 1 : 0) - (this.isLeft ? 1 : 0);
        this.moveDir.y = (this.isUp ? 1 : 0) - (this.isDown ? 1 : 0);
        this.moveDir.normalize();
        return this.moveDir;
    }

    public calculateRotationAngle(event: EventMouse, camera: Camera, playerPos: Readonly<Vec3>): number {
        return 0;
    }
}


