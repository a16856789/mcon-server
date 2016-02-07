

var updateTime = 'connecting...';
function updateStatus() {
    $('#stats tbody').html('')
        .append('<tr><td>update time</td><td>' + updateTime + '</td></tr>');
}

function update() {
    updateTime = 'connecting...';

    $.getJSON('/proxy/invoke', {
        serviceId: 'mcon.ServiceManager',
        methodName: 'listAll',
        params: '[]'
    }).done(function(res) {
        if (res.success) {
            var list = res.response;
            $('#services tbody').html('');
            list.forEach(function(x) {
                var tr = $('<tr></tr>')
                tr.append('<td>' + x.serviceId + '</td>');
                tr.append('<td>' + x.clientIds + '</td>');
                $('#services tbody').append(tr);
            });
            updateTime = '' + new Date();
        } else {
            updateTime = 'err: ' + res.error;
            console.error(res);
        }
        updateStatus();
    }).fail(function() {
        updateTime = 'can not connect to mcon server';
        updateStatus();
    });

    $.getJSON('/proxy/invoke', {
        serviceId: 'mcon.ClientManager',
        methodName: 'listAll',
        params: '[]'
    }, function(res) {
        if (res.success) {
            var list = res.response;
            $('#clients tbody').html('');
            list.forEach(function(x) {
                var tr = $('<tr></tr>')
                tr.append('<td>' + x.clientId + '</td>');
                tr.append('<td>' + (x.name || '') + '</td>');
                tr.append('<td>' + (x.version || '') + '</td>');
                tr.append('<td>' + (x.connType || '') + '</td>');
                tr.append('<td>' + (x.serviceIds || []).join('<br>') + '</td>');
                $('#clients tbody').append(tr);
            });
            updateTime = '' + new Date();
        } else {
            updateTime = 'err: ' + res.error;
            console.error(res);
        }
        updateStatus();
    });
}

setInterval(function() {
    update();
}, 2000)
update();
