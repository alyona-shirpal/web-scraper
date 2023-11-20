export class NewService {
    private static instance: NewService;

    static init(): NewService {
        this.instance = new NewService();
        return this.instance
    }

   static getInstance():NewService {
        if(!this.instance) {
            return new Error('NewService not initialized. Please call init first!')
        }
        return this.instance;
    }

}
