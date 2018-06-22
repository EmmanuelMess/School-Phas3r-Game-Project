const GRAVEDAD = 250;
const VELOCIDAD_BALAS = 400;
const ESPARCIMIRENTO = 50;

const juego = new Phaser.Game(800, 220, Phaser.CANVAS, 'bloque_juego');

let tileSprite;//para actualizar el movimiento del terreno, darle macarena
let limitesTerreno = 0;//pa que no se salga de los limites del nivel
let Mapa;
let Layer;
let Marco;
let Cursors;
let Piso;
let Balas = [];
let EnemigosACrear = [[450, 1], [1000, 4], [2000, 8], [5000, 16]]; EnemigosACrear.reverse();
let Enemigos = [];
let sprites;

class Bala extends Phaser.Sprite {
    constructor(juego, x, y) {
        super(juego, x, y, 'bala');
        Balas.push(this);

        this.creacionTiempo = Date.now();
        this.cargado = false;
    }

    load() {
        this.body.gravity = 0;
        this.body.velocity.x = VELOCIDAD_BALAS;
    }

    updateElem() {
        if (!this.cargado) {
            this.load();
            this.cargado = true;
        }

        if (this.creacionTiempo > 500) {
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
        //Enemigos.push(this);
    }

    load() {
        this.animations.add('QuietMummy', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], 7, true);
        this.body.collideWorldBounds = true;
    }

    updateElem() {
        this.animations.play('QuietMummy');
        if (Marco.x <= this.x) {
            this.scale.setTo(-1, 1);
            if(this.body.touching.down) {
                this.body.velocity.x = -gaussianRandom(40, 80);
            }
        } else {
            this.scale.setTo(1, 1);
            if(this.body.touching.down) {
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
        this.body.collideWorldBounds = true;

        //FIXUP: Agarro solo un par de frames porque los faltantes estan mal cortados CorreR = [0,2,3,4,5,6] frames de Correr
        //Marco.animations.add('CorreR', [0, 2, 3, 4, 5, 6], 10, true);
    }

    mover(cursors) {
        if (cursors.up.isDown && this.body.touching.down) {
            this.body.velocity.y = -200;
        }

        if (this.y >= 200) {
            this.body.velocity.y = 0;
        }

        if (cursors.right.isDown && this.x <= 770) {
            this.scale.setTo(1, 1);

            this.x++;
            if (this.x >= 600 && limitesTerreno < 920) {
                tileSprite.tilePosition.x -= 3;
                this.x--;
                limitesTerreno++;
            }
            if (limitesTerreno >= 920) {
                this.x++;
            }
        }
        if (cursors.left.isDown && this.x !== 10) {
            this.scale.setTo(-1, 1);

            this.x--;
        }
    }

    fire() {
        if (Date.now() - this.enfriadoTiempoInicio > 500) {
            console.log("Fired");
            this.enfriadoTiempoInicio = Date.now();
            let bala = new Bala(juego, this.x + 15, this.y + 20);
            juego.add.existing(bala);
            juego.physics.enable(bala, Phaser.Physics.ARCADE);
            bala.body.allowGravity = false;
        }
    }

    updateElem(cursors) {
        this.animations.play('Quiet');
        this.mover(cursors);
        if (cursors.space.isDown) {
            this.fire();
        }
    }
}

let Estado = {
    preload: function () {//sube todo
        juego.load.image('piso', 'assets/piso.png');
        juego.load.image('fondoterreno', 'assets/fondo.png');//cargo mi imagen
        juego.load.image('bala', 'assets/fireball.png');
        juego.load.spritesheet('Correr', 'assets/Correr.png', 31.75, 40);//cargo mi conjunto de imagenes para marco y la nombro MarcoRun
        juego.load.spritesheet('Quieto', 'assets/Quieto.png', 30, 40);
        juego.load.spritesheet('QuietoMummy', 'assets/metalslug_mummy37x45.png', 37, 45);

    },

    create: function () {//se arranca solo una vez como un constructor  mas o menos
        juego.physics.startSystem(Phaser.Physics.ARCADE);

        tileSprite = juego.add.tileSprite(0, 0, 800, 220, 'fondoterreno');//muestro por pantalla el terreno dandole los limites laterales, superior e inferior + el objeto
        Cursors = juego.input.keyboard.addKeys({
            'up': Phaser.KeyCode.UP, 'down': Phaser.KeyCode.DOWN,
            'left': Phaser.KeyCode.LEFT, 'right': Phaser.KeyCode.RIGHT, 'space': Phaser.KeyCode.SPACEBAR
        });

        juego.physics.arcade.gravity.y = GRAVEDAD;

        Marco = new MarcoPlayer(juego, 35, 160, 1);

        juego.add.existing(Marco);
        juego.physics.enable(Marco);

        Marco.load();

        // Creo el piso
        Piso = juego.add.group();
        for (let x = 0; x < juego.width; x += 32) {
            let segmentoPiso = juego.add.sprite(x, juego.height - 20, 'piso');
            juego.physics.enable(segmentoPiso, Phaser.Physics.ARCADE);
            segmentoPiso.body.immovable = true;
            segmentoPiso.body.allowGravity = false;
            Piso.add(segmentoPiso);
        }
    },

    update: function () {//se verifica frame a frame izi
        juego.physics.arcade.collide(Marco, Piso);
        //  juego.physics.arcade.collide(sprites, Piso);
        Marco.updateElem(Cursors);

        if(EnemigosACrear.length > 0) {
            let lastEnemy = EnemigosACrear.slice(-1).pop();
            if (lastEnemy[0] < Marco.x + 450) {
                let xEnemigo = lastEnemy[0];
                let cantEnemigos = lastEnemy[1];

                for (let i = 0; i < cantEnemigos; i++) {
                    let x = gaussianRandom(xEnemigo - (ESPARCIMIRENTO / 2), xEnemigo + (ESPARCIMIRENTO / 2));
                    let enemigo = new Enemy(juego, x, 155, 1);
                    Enemigos.push(enemigo);
                    juego.add.existing(enemigo);
                    juego.physics.enable(enemigo);
                    enemigo.load();
                }

                EnemigosACrear.pop();
            }
        }

        Enemigos.forEach(function (enemigo) {
            juego.physics.arcade.collide(enemigo, Piso);

            enemigo.updateElem();
        });
        Balas.forEach(function (bala) {
            bala.updateElem();
        });
    }
};

juego.state.add('principal', Estado);
juego.state.start('principal');

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