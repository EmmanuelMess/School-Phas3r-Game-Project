const GRAVEDAD = 250;
const VELOCIDAD_BALAS = 400;
const ESPARCIMIRENTO = 50;

const JUEGO = new Phaser.Game(800, 220, Phaser.CANVAS, 'bloque_juego');

const AnimacionEnum = Object.freeze({quieto:1, correr:2, salto:3, disparar:4, agachar:5, recargar:6});

let TileSprite;//para actualizar el movimiento del terreno, darle macarena
let LimitesTerreno = 0;//pa que no se salga de los limites del nivel
let Mapa;
let Layer;
let Marco;
let Cursors;
let Piso;
let Balas = [];
let EnemigosACrear = [[0, 10], [450, 4], [750, 8], [1125, 16], [1500, 32]]; EnemigosACrear.reverse();
let Enemigos = [];
let sprites;
let generadoroleada = 0;
let IzqierdaODerecha = false;
let Animacion = AnimacionEnum.quieto;

class Bala extends Phaser.Sprite {
    constructor(juego, x, y) {
        super(juego, x, y, 'bala');
        Balas.push(this);
        this.creacionTiempo = Date.now();
        this.cargado = false;
    }

    load() {
        this.body.gravity = 0;
        if (!IzqierdaODerecha) {
            this.body.velocity.x = VELOCIDAD_BALAS;
            this.scale.setTo(1, 1);
        } else {
            this.body.velocity.x = -VELOCIDAD_BALAS;
            this.x = Marco.x - 30;
            this.scale.setTo(-1, 1);
        }
    }

    updateElem() {
        if (!this.cargado) {
            this.load();
            this.cargado = true;
        }

        if (this.creacionTiempo - Date.now() > 1000) {
            let indice = Balas.indexOf(this);
            if (indice > -1) {
                 Balas.splice(indice, 1);
            }
        }
    }
}

class Enemy extends Phaser.Sprite {
    constructor(juego, x, y) {
        super(juego, x, y, 'QuietoMummy');
        this.scale.setTo(1, 1);
    }

    load() {
        this.animations.add('QuietMummy', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], 7, true);
        this.body.collideWorldBounds = true;
    }

    updateElem() {
        this.animations.play('QuietMummy');
        if (Marco.x <= this.x) {
            this.scale.setTo(-1, 1);
            if (this.body.touching.down) {
                this.body.velocity.x = -gaussianRandom(40, 80);
            }
        } else {
            this.scale.setTo(1, 1);
            if (this.body.touching.down) {
                this.body.velocity.x = gaussianRandom(8, 40);
            }
        }
    }
}

class MarcoPlayer extends Phaser.Sprite {
    constructor(juego, x, y) {
        super(juego, x, y, 'Quieto');
        this.enfriadoTiempoInicio = 0;
    }

    load() {
        this.animations.add('Quiet', [0, 1, 2], 3, true);
        this.animations.add('CorreR', [3, 4, 5, 6, 7, 8, 9, 10, 11], 3, true);
        this.animations.add('SaltO', [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22], 3, true);
        this.animations.add('DisparO', [23, 24], 3, true);
        this.animations.add('AgachO', [25, 26, 27, 28, 29, 30], 3, true);
        this.animations.add('RecargA', [31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45], 3, true);
        this.body.collideWorldBounds = true;
    }

    iniciarAnimacion(animacion) {
        if(Animacion === animacion) return;
        let animacionNombre = 'Quiet';
        let frameRate = 3;

        switch(animacion) {
            case AnimacionEnum.correr:
                animacionNombre = 'CorreR';
                frameRate = 8;
                break;
            case AnimacionEnum.salto:
                animacionNombre = 'Salt0';
                frameRate = 6;
                break;
            case AnimacionEnum.disparar:
                animacionNombre = 'Dispar0';
                frameRate = 9;
                break;
            case AnimacionEnum.agachar:
                animacionNombre = 'Agacha0';
                frameRate = 3;
                break;
            case AnimacionEnum.recargar:
                animacionNombre = 'RecargA';
                frameRate = 3;
                break;
        }

        this.animations.stop();
        this.animations.play(animacionNombre, frameRate, true);
        Animacion = animacion;
    }

    mover(cursors) {
        if (!cursors.left.isDown && !cursors.right.isDown && !cursors.up.isDown && !cursors.down.isDown
            && !cursors.space.isDown) {
            this.iniciarAnimacion(AnimacionEnum.quieto);
        }

        if (cursors.up.isDown && this.body.touching.down) {
            this.iniciarAnimacion(AnimacionEnum.salto);
            this.body.velocity.y = -200;
            Animacion = 1;
        }

        if (this.y >= 200) {
            this.body.velocity.y = 0;
        }

        if (cursors.right.isDown && this.x <= 770) {
            this.iniciarAnimacion(AnimacionEnum.correr);

            if (IzqierdaODerecha) {
                this.x = this.x - 30;
            }
            IzqierdaODerecha = false;
            this.scale.setTo(1, 1);
            generadoroleada++;
            this.x++;
            if (this.x >= 600 && LimitesTerreno < 920) {
                TileSprite.tilePosition.x -= 3;
                this.x--;
                LimitesTerreno++;
            }
            if (LimitesTerreno >= 920) {
                this.x++;
            }
        }
        if (cursors.left.isDown && this.x !== 10) {
            this.scale.setTo(-1, 1);
            this.iniciarAnimacion(AnimacionEnum.correr);
            if (!IzqierdaODerecha) { this.x = this.x + 30; }
            IzqierdaODerecha = true;
            generadoroleada--;
            // this.animations.play('CorreR', 30, true);
            this.x--;
        }
        if (cursors.space.isDown) {
            this.iniciarAnimacion(AnimacionEnum.disparar);
        }

        if (cursors.down.isDown) {
            this.iniciarAnimacion(AnimacionEnum.agachar);
        }

        if (Balas.length % 10 == 0) {
            this.iniciarAnimacion(AnimacionEnum.recargar);
        }
    }

    fire() {
        if (Date.now() - this.enfriadoTiempoInicio > 500) {
            console.log("Fired");
            this.enfriadoTiempoInicio = Date.now();
            let bala = new Bala(JUEGO, this.x + 50, this.y + 10);
            JUEGO.add.existing(bala);
            JUEGO.physics.enable(bala, Phaser.Physics.ARCADE);
            bala.body.allowGravity = false;
        }
    }

    updateElem(cursors) {
        this.mover(cursors);
        if (cursors.space.isDown) {
            this.fire();
        }
    }
}

let Estado = {
    preload: function () {//sube todo
        JUEGO.load.image('piso', 'assets/piso.png');
        JUEGO.load.image('fondoterreno', 'assets/fondo.png');//cargo mi imagen
        JUEGO.load.image('bala', 'assets/fireball.png');
        JUEGO.load.spritesheet('Correr', 'assets/Correr.png', 31.75, 40);//cargo mi conjunto de imagenes para marco y la nombro MarcoRun
        JUEGO.load.spritesheet('Quieto', 'assets/Quieto.png', 55, 42);
        JUEGO.load.spritesheet('QuietoMummy', 'assets/metalslug_mummy37x45.png', 37, 45);

    },

    create: function () {//se arranca solo una vez como un constructor  mas o menos
        JUEGO.physics.startSystem(Phaser.Physics.ARCADE);

        TileSprite = JUEGO.add.tileSprite(0, 0, 800, 220, 'fondoterreno');//muestro por pantalla el terreno dandole los limites laterales, superior e inferior + el objeto
        Cursors = JUEGO.input.keyboard.addKeys({
            'up': Phaser.KeyCode.UP, 'down': Phaser.KeyCode.DOWN,
            'left': Phaser.KeyCode.LEFT, 'right': Phaser.KeyCode.RIGHT, 'space': Phaser.KeyCode.SPACEBAR
        });

        JUEGO.physics.arcade.gravity.y = GRAVEDAD;

        Marco = new MarcoPlayer(JUEGO, 35, 160, 1);

        JUEGO.add.existing(Marco);
        JUEGO.physics.enable(Marco);

        Marco.load();

        // Creo el piso
        Piso = JUEGO.add.group();
        for (let x = 0; x < JUEGO.width; x += 32) {
            let segmentoPiso = JUEGO.add.sprite(x, JUEGO.height - 12, 'piso');
            JUEGO.physics.enable(segmentoPiso, Phaser.Physics.ARCADE);
            segmentoPiso.body.immovable = true;
            segmentoPiso.body.allowGravity = false;
            Piso.add(segmentoPiso);
        }
    },

    update: function () {//se verifica frame a frame izi
        JUEGO.physics.arcade.collide(Marco, Piso);
        Marco.updateElem(Cursors);

        if (EnemigosACrear.length > 0) {
            let lastEnemy = EnemigosACrear.slice(-1).pop();
            if (lastEnemy[0] == generadoroleada) {
                let xEnemigo = lastEnemy[0];
                let cantEnemigos = lastEnemy[1];

                for (let i = 0; i < cantEnemigos; i++) {
                    let enemigo = new Enemy(JUEGO, JUEGO.rnd.integerInRange(100, 700), 0, 1);
                    Enemigos.push(enemigo);
                    JUEGO.add.existing(enemigo);
                    JUEGO.physics.enable(enemigo);
                    enemigo.load();
                }

                EnemigosACrear.pop();
            }
        }

        Enemigos.forEach(function (enemigo) {
            JUEGO.physics.arcade.collide(enemigo, Piso);
            if (enemigo != null) {
                enemigo.updateElem();
            }
        });

        Balas.forEach(function (bala) {
            if (bala != null) {
                bala.updateElem();
            }
        });

        console.log(Balas.length);

        for (let i = 0; i < Enemigos.length; i++) {
            for (let j = 0; j < Balas.length; j++) {
                if (Enemigos[i] != null && Balas[j] != null) {
                    if (Math.abs(Balas[j].x - Enemigos[i].x) < 37 && Balas[j].x < 800) {
                        if (!IzqierdaODerecha) {
                            Balas[j].kill();
                            Balas[j] = null;
                            Enemigos[i].kill();
                            Enemigos[i] = null;
                        } else {
                            Balas[j].kill();
                            Balas[j] = null;
                            Enemigos[i].kill();
                            Enemigos[i] = null;
                        }
                    }
                }
            }
        }
    }
};

JUEGO.state.add('principal', Estado);
JUEGO.state.start('principal');

//Funciona masomeno pero es rapida
function gaussianRand() {
    let rand = 0;

    for (let i = 0; i < 6; i += 1) {
        rand += Math.random();
    }

    return rand / 6;
}

function gaussianRandom(start, end) {
    return Math.floor(start + gaussianRand() * (end - start + 1));
}

