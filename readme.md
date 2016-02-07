# Mcon Server

## Services

```javascript
// @param headers.oneway    true/false
// @param headers.timeout   timeout (ms)
// @param headers.clientId  caller client id
// @param headers           other header fields will pass through
// @param serviceId         service id
// @param methodName        method name
// @param params            params, usually an array
// @param callback          callbak(err, response)
services.invoke({
    headers: {
        oneway: false,
        timeout: 300,
        clientId: 'client-123'
    },
    serviceId: '',
    methodName: '',
    params: [1, 2, 3]
}, function(err, response) {
    if (err) {
    } else {
    }
});
```

## Clients

```javascript
// @see Services.invoke
Client.prototype.invoke = function(conf, callback) {
};
```

## Monitor

- http://localhost:8124
