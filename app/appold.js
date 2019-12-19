"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var laravel_echo_1 = __importDefault(require("laravel-echo"));
var axios = require('axios');
var token = "";
var codice_impianto = "WOLLS19;";
var nome_impianto = "";
//const app: express.Application = express();
var io = require('socket.io-client');
var echo;
login();
startServer();
function login() {
    axios.post(' http://3.16.169.253/itproxy/public/login', {
        username: 'italprogetti',
        password: '1',
        plant_code: 'WOLLS19;'
    })
        .then(function (res) {
        if (res.status == 200) {
            token = res.data.success.token;
            getPlantData();
            // startServer();
        }
    })
        .catch(function (error) {
        console.log("UNAUTHORIZED");
        console.error(error);
    });
}
function getPlantData() {
    console.log("RETRIVNIG PLANT DATA...");
    var url = 'http://3.16.169.253/itproxy/public/api/impianto/' + codice_impianto;
    axios.get(url, { headers: {
            "Authorization": "Bearer " + token,
        }
    }).then(function (res) {
        if (res.status == 200) {
            nome_impianto = res.data.nome;
            sendData();
        }
    });
}
function startServer() {
    echo = new laravel_echo_1.default({
        broadcaster: 'socket.io',
        host: 'http://3.16.169.253:6001',
        client: io,
        auth: { headers: { Authorization: "Bearer " + token } }
    });
}
function sendData() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("SENDING DATA");
                    return [4 /*yield*/, sleep(2000)];
                case 1:
                    _a.sent();
                    echo.channel(nome_impianto).listen('.actionrequest', function (e) {
                        var action = e['action'];
                        var id = e['id'];
                        if (action == "getodp") {
                            var id_odp = e['param1'];
                            var url = 'http://localhost/getodp/' + id_odp;
                            console.log(url);
                            axios.get(url).then(function (response) {
                                axios.post('http://3.16.169.253:6001/apps/06be5ce7b43ad4f7/events?auth_key=a0764f6b0a5f586a0e7fcf72ffe3e01f', {
                                    "channel": nome_impianto,
                                    "name": "actionresponse",
                                    "data": { "eventData": JSON.stringify(response.data), "id": id, "action": "getodp" },
                                    "socket_id": echo.connector.socket.id
                                })
                                    .then(function (response) {
                                });
                            });
                        }
                        if (action == "getodplist") {
                            var stato = e['param1'];
                            // let limit =  e['param2'];
                            var url = 'http://localhost/getodplist/' + stato + "/100000";
                            console.log(url);
                            axios.get(url).then(function (response) {
                                axios.post('http://3.16.169.253:6001/apps/06be5ce7b43ad4f7/events?auth_key=a0764f6b0a5f586a0e7fcf72ffe3e01f', {
                                    "channel": nome_impianto,
                                    "name": "actionresponse",
                                    "data": { "eventData": JSON.stringify(response.data), "id": id, "action": "getodplist" },
                                    "socket_id": echo.connector.socket.id
                                })
                                    .then(function (response) {
                                });
                            });
                        }
                        if (action == "getconsumi") {
                            var id_odp = e['param1'];
                            var url = 'http://localhost/getconsumi/' + id_odp;
                            console.log(url);
                            axios.get(url).then(function (response) {
                                axios.post('http://3.16.169.253:6001/apps/06be5ce7b43ad4f7/events?auth_key=a0764f6b0a5f586a0e7fcf72ffe3e01f', {
                                    "channel": nome_impianto,
                                    "name": "actionresponse",
                                    "data": { "eventData": JSON.stringify(response.data), "id": id, "action": "getconsumi" },
                                    "socket_id": echo.connector.socket.id
                                })
                                    .then(function (response) {
                                });
                            });
                        }
                    });
                    return [4 /*yield*/, sleep(3000)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    if (!true) return [3 /*break*/, 5];
                    return [4 /*yield*/, sleep(2000)];
                case 4:
                    _a.sent();
                    axios.get('http://localhost/api/auth/getdata').then(function (response) {
                        axios.post('http://3.16.169.253:6001/apps/06be5ce7b43ad4f7/events?auth_key=a0764f6b0a5f586a0e7fcf72ffe3e01f', {
                            "channel": nome_impianto,
                            "name": "drumdata",
                            "data": { "eventData": JSON.stringify(response.data) },
                            "socket_id": echo.connector.socket.id
                        })
                            .then(function (response) {
                        });
                    });
                    return [3 /*break*/, 3];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function sleep(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
