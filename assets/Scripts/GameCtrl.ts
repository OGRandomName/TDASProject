import { _decorator, Camera, Component, EventKeyboard, EventMouse, Node, Prefab } from 'cc';
import { Player } from './Player';
const { ccclass, property } = _decorator;

@ccclass('GameCtrl')
export class GameCtrl extends Component {
    
    @property({ type: Player, tooltip: 'Drop the Player node here' })
    public player: Player | null = null;

    @property({ type: Camera, tooltip: 'Drop the Camera node here' })
    public camera: Camera | null = null;
    
    @property({ type: Prefab, tooltip: 'Drop the default bullet prefab here' })
    public defaultBulletPrefab: Prefab | null = null;    

    @property({ type: Node, tooltip: 'Drop the container for bullets' })
    public bulletContainer: Node | null = null;
    
    
    

    
    start() {

    }

    protected onDestroy(): void {
        
    }

    update(deltaTime: number) {
        
    }

    private onKeyUp(event: EventKeyboard): void { }
    private onKeyDown(event: EventKeyboard): void { }
    private onMouseMove(event: EventMouse): void { }
    private onMouseDown(event: EventMouse): void { }
    private onMouseUp(event: EventMouse): void { }
}


