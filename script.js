version = 'v1.2.0';

exitPopup = function() {
    $('.popupContainer').html('');
    $('.main').css('pointer-events', 'auto');
    $('.main').css('opacity', '1');
    $('.buttons').css('opacity', '1');
    $('.popupContainer').css('opacity', '0');
    $('.popupContainer').css('pointer-events', 'none');
};

var popupHTMLContainer = [
    '<button class="exitPopup" onclick="exitPopup();" style="float:left !important;">X</button>',
    '<br><h2>Players Online</h2><br><hr><br>',
    '<a>test1</a>'
];

popup = function(popupHTML) {
    ingame = false;

    $('.buttons').css('opacity', '0');
    $('.main').css('pointer-events', 'none');
    $('.main').css('opacity', '0.5');
    $('.popupContainer').prepend('' + popupHTMLContainer[popupHTML]);
    $('.popupContainer').css('opacity', '1');
    $('.popupContainer').css('pointer-events', 'auto');
};

$(document).ready(function() {
    $('input, textarea').attr('spellcheck', 'false');
});

if (!Date.now) {
    Date.now = function now() {
        return new Date().getTime();
    };
}

ingame = false;

$log = function(m) {
    $('.mainLog')[0].innerHTML += '<p>' + m + '</p><br>';
    a = $('br');
    a[a.length - 1].scrollIntoView();
    $('.mainLog')[0].scrollTop += 1000;
};

var peer;

init = function($_id) {
    window.$_id = $_id;

    gj.data.fetch('main&username=' + user + '&user_token=' + token, function(a) {
        if (a.success == "false") {
            $('#bears').css('opacity', '1');
            $('#bears').css('pointer-events', 'auto');
        } else if (JSON.parse(a.data).bears == undefined) {
            $('#bears').css('opacity', '1');
            $('#bears').css('pointer-events', 'auto');
        } else {
            stats = JSON.parse(a.data);
            s = JSON.parse(a.data);
            popup(1);
            $('#bears')[0].remove();
        }

    });

    window.peer = new Peer($_id, {
        host: 'andrewrivers.me',
        port: 9000
    });

    window.peer.on('error', function(e) {
        if (e.type == 'unavailable-id') {
            console.log(e.message);
            console.log('Retrying..');
            init($_id + '0');
        } else if (e.type == 'peer-unavailable') {
            $log('Couldn\'t connect.');
        } else {
            console.log(e.message);
        }
    });

    window.addEventListener('unload', function(a) {
        peer.destroy();
    });

    peer.on('connection', function(conn) {
        conn.open = true;
        $log("Connected to " + conn.peer + ".");
        turn = true;
        exitPopup();
        conn.on("close", function() {
            pClose(conn);
        });
        conn.on('error', function(e) {
            console.log(e);
        });
        conn.on('data', function(d) {
            received(d)
        });
        window.conn = conn;
        setTimeout(game, 1000);
        lturn();
    });

    peer.on('open', function(e) {
        console.log('Success! ID:', e);
        getP();
        setTimeout(pingU, 5000);
        gj.data.set($_id, JSON.stringify({
            time: Math.round(Date.now() / 1000) + '',
            game: ingame
        }));
    });

    peer.on('close', function() {
        console.log('Closed.');
    });

    gj.sessions.open(user, token);

    function pingU() {
        gj.sessions.ping(user, token, function(a) {});
        gj.data.set($_id, JSON.stringify({
            time: Math.round(Date.now() / 1000) + '',
            game: ingame
        }));
        setTimeout(pingU, 2000);
    }


    pArr = [];

    function getP() {
        gj.data.get(function(a) {
            d = a.keys.length;
            window.keysA = a;

            function loopA(e) {
                b = a.keys[e - 1].key;

                gj.data.fetch(b, function(a) {
                    if (b != $_id && !ingame) {
                        a = JSON.parse(a.data);
                        g = a.game;
                        a = eval(a.time);
                        ct = Math.round(Date.now() / 1000);

                        if (!g && $('#' + b).length == 0 && ct - a < 5 && pArr.indexOf(b) < 0) {
                            pArr.push(b);
                            $('.popupContainer')[0].innerHTML += '<h3 id="' + b + '"onclick="establish(this.innerText);">' + b + '</h3>';
                        } else if (ct - a >= 10 || g) {
                            if (pArr.indexOf(b) > -1) {
                                pArr.splice(pArr.indexOf(b), 1);
                                $('#' + b)[0].remove();
                            }
                            if (ct - a >= 30) {
                                gj.data.remove(b);
                            }
                        }
                    }
                    if (e > 1) {
                        loopA(e - 1);
                    }
                });

            };
            loopA(d);
        });

        setTimeout(getP, 3000);
    }

};

gj.data.set = function(k, d) {
    $get(gj.hash('data-store/set', '&key=' + k + '&data=' + d), function(a) {});
};

function pClose() {
    if (ingame) {
        $log('Connection dropped.');
        ingame = false;
        s = JSON.parse(JSON.stringify(stats));
        conn.close();

        $('.right').css('opacity', '0');

        setTimeout(
            function() {
                popup(1)
            }, 250);
    }
};

var conn;

function establish(remoteID) {
    window.conn = peer.connect(remoteID);
    conn.on('open', function() {
        $log("Connected to " + conn.peer + ".");
        rturn();
        exitPopup();
        conn.on("close", function() {
            pClose(conn);
        });
        conn.on('error', function(e) {
            console.log(e);
        });
        conn.on('data', function(d) {
            received(d)
        });
        window.conn = conn;
        setTimeout(game, 1000);
    });
}

gj.setup('276536', 'b057f0dd8d3f6f2f9771efe85cd4e336');

//$ = function(id){
//    return document.getElementById(id);
//}

var auth;
var user;
var token;
var info;

function loginTest() {
    $('#b-login')[0].addEventListener('click', function(a) {
        user = $('#i-user')[0].value;
        token = $('#i-token')[0].value;
        gj.users.auth(user, token, function(a) {
            if (a.success == 'true') {
                localStorage.gjuser = $('#i-user')[0].value;
                localStorage.gjtoken = $('#i-token')[0].value;
                $('#login')[0].remove();

                gj.users.fetch(localStorage.gjuser, function(a) {
                    window.info = a.users[0];
                    init(localStorage.gjuser);
                });

                auth = true;
            } else {
                user = $('#i-user')[0].value = '';
                token = $('#i-token')[0].value = '';
                document.getElementsByTagName('body')[0].innerHTML += "<br>Invalid Login.";
            }
        });

    });
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

if (localStorage.gjuser == undefined) {
    loginTest();
} else {
    gj.users.auth(localStorage.gjuser, localStorage.gjtoken, function(a) {
        if (a.success == 'true') {
            auth = true;
            $('#login')[0].remove();

            user = localStorage.gjuser;
            token = localStorage.gjtoken;

            gj.users.fetch(localStorage.gjuser, function(a) {
                init(localStorage.gjuser);
                window.info = a.users[0];
            });

        } else {
            loginTest();
        }
    });
}

stats = {
    hp: 20,
    atk: 10,
    def: 5,
    acc: 5,
    bear: 0
};

rstats = {};

function message(m) {
    send({
        type: 'chat',
        value: m
    });
    $log(escapeHtml($_id) + ': ' + escapeHtml(m));
};

lturn = function() {
    $log('<b>Your turn.</b>');
    turn = true;
};

rturn = function() {
    $log('<b>Waiting for ' + conn.peer + '...');
    turn = false;
};

function received(d) {
    console.log(d);
    if (d.type == 'chat') {
        $log(escapeHtml(conn.peer) + ': ' + escapeHtml(d.value));
    } else if (d.type == 'miss') {
        $log(conn.peer + '\'s bear missed! Embearassing!');
        lturn();
    } else if (d.type == 'attack') {
        dam = d.damage;
        s.hp -= dam;
        setStats();
        $log('Your bear was hit with ' + dam + ' attack!');
        send({
            type: 'stats',
            stats1: s
        });
        if (s.hp <= 0) {
            lose();
        } else {
            lturn()
        }
    } else if (d.type == 'stats') {
        rstats = d.stats1;
        setStats();

        $('#r-stats').css('background-image', 'url(' + bears[d.stats1.bear] + ')');

        if (rstats.hp <= 0) {
            win();
        }
    } else if (d.type == 'defend') {
        $log(conn.peer + '\'s bear used Defend!<br>Their defense was raised!');
        lturn();
    } else if (d.type == 'heal') {
        $log(conn.peer + '\'s bear used Heal!<br>Their health was raised!');
        lturn();
    } else if (d.type == 'focus') {
        $log(conn.peer + '\'s bear used Focus!<br>Their accuracy was raised!');
        lturn();
    } else if (d.type == 'aggression') {
        $log(conn.peer + '\'s bear used Aggression!<br>Their attack was raised!');
        lturn();
    }

    a = $('p');
    a[a.length - 1].scrollIntoView();
};
$r = function(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
};

send = function(j) {
    conn.send(j);
};

setStats = function() {
    $('#l-hp')[0].innerHTML = 'HP: ' + s.hp;
    $('#l-atk')[0].innerHTML = 'ATK: ' + s.atk;
    $('#l-def')[0].innerHTML = 'DEF: ' + s.def;
    $('#l-acc')[0].innerHTML = 'ACC: ' + s.acc;

    $('#r-hp')[0].innerHTML = 'HP: ' + rstats.hp;
    $('#r-atk')[0].innerHTML = 'ATK: ' + rstats.atk;
    $('#r-def')[0].innerHTML = 'DEF: ' + rstats.def;
    $('#r-acc')[0].innerHTML = 'ACC: ' + rstats.acc;
};

turn = false;
var s = JSON.parse(JSON.stringify(stats));
game = function() {
    pArr = [];
    setStats();
    s = JSON.parse(JSON.stringify(stats));
    send({
        type: 'stats',
        stats1: stats
    });
    ingame = true;

    $('#l-stats').css('background-image', 'url(' + bears[stats.bear] + ')');

    $('.right').css('opacity', '1');
    window.attack = function(w) {
        if (turn) {
            if (w == 0) {
                d = $r(s.atk / 3, s.atk + 1) - $r(0, rstats.def / 2);
                if (d < 0) {
                    d = 0
                };
                chance = $r(0, s.acc + 1);
                if (chance < 2) {
                    d = 0;
                    send({
                        type: 'miss'
                    });
                    $log('Bearly missed!');
                } else {
                    send({
                        type: 'attack',
                        damage: d
                    });
                    $log('Your bear hit with ' + d + '!<br>A grizzly performance!');
                }
            } else if (w == 1) {
                nd = Math.round(stats.def / 3);
                s.def += nd;
                send({
                    type: 'defend'
                });
                send({
                    type: 'stats',
                    stats1: s
                });
                setStats();
                $log('Your bear raised defense by ' + nd + '!<br>You can bear anything!')
            } else if (w == 2) {
                nhp = Math.round(stats.hp / 3);
                s.hp += nhp;
                send({
                    type: 'heal'
                });
                send({
                    type: 'stats',
                    stats1: s
                });
                setStats();
                $log('Your bear raised health points by ' + nhp + '!<br>Impawssible!')
            } else if (w == 3) {
                nac = Math.round(stats.acc / 3);
                s.acc += nac;
                send({
                    type: 'focus'
                });
                send({
                    type: 'stats',
                    stats1: s
                });
                setStats();
                $log('Your bear raised accuracy points by ' + nac + '!<br>A koalaty move!')
            } else if (w == 4) {
                na = Math.round(stats.atk / 4);
                s.atk += na;
                send({
                    type: 'aggression'
                });
                send({
                    type: 'stats',
                    stats1: s
                });
                setStats();
                $log('Your bear raised attack by ' + na + '!<br>Your bear is gonna maul ' + conn.peer + '\'s!')
            };

            rturn();
        } else if (ingame) {
            $log('Not your turn!');
        }
    }
};

bears = ['bear1.png', 'bear2.png', 'bear3.png', 'bear4.png'];

sstats = function(h, a, d, acc) {
    stats.hp = h;
    stats.atk = a;
    stats.def = d;
    stats.acc = acc;
};

ingame = true;

bear = function(c) {
    stats.bear = c;
    if (c == 0) {
        sstats(20, 12, 12, 12);
    } else if (c == 1) {
        sstats(30, 8, 15, 8);
    } else if (c == 2) {
        sstats(25, 12, 8, 15);
    } else if (c == 3) {
        sstats(15, 15, 10, 15);
    }

    var s = JSON.parse(JSON.stringify(stats));

    $('#bears')[0].remove();

    popup(1);

    gj.data.set('main&username=' + user + '&user_token=' + token, JSON.stringify(stats));
};

win = function() {
    stats.hp += Math.round(stats.hp / 12) + 2;
    stats.atk += Math.round(stats.atk / 16) + 1;
    stats.def += Math.round(stats.def / 16) + 1;
    stats.acc += Math.round(stats.acc / 16) + 1;
    rstats.hp = 10;
    s = JSON.parse(JSON.stringify(stats));
    setStats();
    turn = false;
    $('.mainLog').html('');
    $log('<b>You won the game!<br>Your stats increased!</b>');
    setTimeout(pClose, 250);

    gj.data.set('main&username=' + user + '&user_token=' + token, JSON.stringify(stats));
};

lose = function() {
    s = JSON.parse(JSON.stringify(stats));
    rstats.hp = 10;
    setStats();
    $('.mainLog').html('');
    $log('<b>You lost the game!</b>');
    turn = false;
    setTimeout(pClose, 250);
};