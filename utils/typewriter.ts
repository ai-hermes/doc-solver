import { Nullable } from "@/typings";

export class Typewriter {
    private queue: string[] = []
    private consuming = false
    private timer: Nullable<NodeJS.Timeout> = null;
    constructor(private onConsume: (str: string) => void) {
    }
    /**
     * return a speed that is inversely proportional to the length of the queue
     */
    dynamicSpeed() {
        const speed = 2000 / this.queue.length
        if (speed > 200) {
            return 200
        } else {
            return speed
        }
    }
    /**
     * when llm output, it should be add to queue by add method
     * @param str 
     * @returns 
     */
    add(str: string) {
        if (!str) return
        this.queue.push(...str.split(''))
    }
    /**
     * shift the first char in the queue, and call onConsume passed by user
     */
    consume() {
        if (this.queue.length > 0) {
            const str = this.queue.shift()
            str && this.onConsume(str)
        }
    }
    /**
     * consume next char in the queue, by recursion
     */
    next() {
        this.consume()
        // set a timer to consume the next char in the queue
        this.timer = setTimeout(() => {
            this.consume()
            if (this.consuming) {
                this.next()
            }
        }, this.dynamicSpeed())
    }
    /**
     * start consuming the queue
     */
    start() {
        this.consuming = true
        this.next()
    }
    /**
     * consume the rest of the queue, and stop process of consuming
     */
    done() {
        this.consuming = false
        this.timer && clearTimeout(this.timer)
        this.onConsume(this.queue.join(''))
        this.queue = []
    }
}