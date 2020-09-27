const isFunction = require('lodash/isFunction')
const isString = require('lodash/isString')

interface MultiPagesRequestorOptions {
    isJson: boolean,
    startPage?: number,
    stopCondition?: any,
    doneCallback: cbType,
}

type urlCreatorType = (url: number) => string;

type cbType = (data: object) => any;



class multiPagesRequestor {
    private counter: number;
    private stopCondition: boolean;
    private readonly url: string|((data: number) => string);
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
        const _url: urlCreatorType = isString(url) ? (() => String(url)) : url

        this.url = (page: number) => _url(page)
        this.counter = options.startPage
        this.doneCallback = options.doneCallback

        this.stopCondition = options.stopCondition

        this.requestGenerator = function *requestPagesAggregator () {
            let pageCount = this.counter
            let data = yield fetch(this.url(pageCount))
            let result = []

            while (this.stopCondition(data)) {
                result.push({page:pageCount, data})
                pageCount += 1

                data = yield fetch(this.url(pageCount))
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
