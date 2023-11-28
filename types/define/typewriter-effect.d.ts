declare module 'typewriter-effect/dist/core' {
    import { TypewriterClass, Options } from 'typewriter-effect'
    export default class Typewriter extends TypewriterClass {
        constructor(container: string | HTMLElement | null, options: Options)
    }
}
