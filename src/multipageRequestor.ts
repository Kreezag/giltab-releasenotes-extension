
interface MultiPagesRequestorOptions {
    isJson: boolean,
    startPage?: number,
    stopCondition?: any,
    doneCallback: cbType,
}

type urlCreatorType = (url: number) => string;

type cbType = (data: object) => any;



class multiPagesRequestor {
    private readonly doneCallback: cbType;
    private readonly requestGenerator: (data: any) => any;

    constructor (
        url: string|urlCreatorType,
        options: MultiPagesRequestorOptions = {
            isJson: true,
            startPage: 0,
            doneCallback: (data) => data,
            stopCondition: (data:any) => !data,
        }
    ) {
        const urlMaker = (page: number) => (typeof url === 'string') ? url : url(page)
        this.doneCallback = options.doneCallback


        this.requestGenerator = function *requestPagesAggregator () {
            let pageCount = options.startPage
            let data = yield fetch(urlMaker(pageCount))
            let result = []

            while (options.stopCondition(data)) {
                result.push({page:pageCount, data})
                pageCount += 1

                data = yield fetch(urlMaker(pageCount))
            }

            return result
        }
    }

    execute (generator, yieldValue = null) {
        let next = generator.next(yieldValue);

        if (!next.done) {
            next.value.then(
                result => this.execute(generator, result),
                err => generator.throw(err)
            );
        } else {
            this.doneCallback(next.value);
        }
    }

    run () {
        return this.execute(this.requestGenerator)
    }
}
