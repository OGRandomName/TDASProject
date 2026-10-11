import {math, Vec2} from "cc"
import { ISteeringBehavior } from "./ISteeringBehavior"
import { IntentSteeringBehavior } from "./IntentSteeringBehavior"
import { IntentConfig } from "./EnemyConfig"

export class WanderBehavior implements ISteeringBehavior {

    private wayPoints: Vec2[] = []
    private currentWayPointIndex: number = 0 
    private wayPointThreshold: number = 10

 
    private compositeIntent: IntentSteeringBehavior = new IntentSteeringBehavior()

    public init(points: Vec2[], intent: IntentConfig) {
        this.setWayPoints(points)
        this.setWeights(intent)
    }

    private setWeights(intent: IntentConfig) {
        this.compositeIntent.setWeights(intent)
    }

    private setWayPoints(points: Vec2[]) {
        this.wayPoints = points
        this.pickNewWanderPoint()
    }

    public pickNewWanderPoint() {
        if (this.wayPoints.length <= 0) return 0
        this.currentWayPointIndex = math.randomRangeInt(0, this.wayPoints.length)
    }

    public hasArrived(currentPos: Vec2): boolean {
        if (this.wayPoints.length <= 0) return

        let currentTarget = this.wayPoints[this.currentWayPointIndex]
        return Vec2.distance(currentPos, currentTarget) <= this.wayPointThreshold

    }

    getDesiredVelocity(currentPosition: Vec2): Vec2 {
        if (this.wayPoints.length === 0) return Vec2.ZERO

        let currentTarget = this.wayPoints[this.currentWayPointIndex]
        return this.compositeIntent.getDesiredVelocity(currentPosition, currentTarget)
    }














}


