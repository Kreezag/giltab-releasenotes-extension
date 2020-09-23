export function *requestGenerator (request) {
    let count = 0
    let hasResults = true
    const result = {}

    while (hasResults) {
        count++

        const data = yield request(count)
        result[count] = data

        hasResults = (Array.isArray(data) && data.length) || data
    }

    return Object.values(result).reduce((result:Array<any>, value) => result.concat(value), [])
}

export function execute(generator, yieldValue, resultCallback) {
    let next = generator.next(yieldValue);

    if (!next.done) {
        next.value.then(
            result => execute(generator, result, resultCallback),
            err => generator.throw(err)
        );
    } else {
        resultCallback(next.value);
    }
}

export const apiRequestGenerator = (request, doneCallback) => {
    execute(requestGenerator(request), '', doneCallback)
}

