var tipoMuro = 2;
var tipoBloque = 3;

var difficulty_level = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
};
difficulty = difficulty_level.EASY;

var animales = {
  PANDA: 1,
  COCODRILO: 2,
  TIGRE: 3,
  KOALA: 4,
  MONO: 5,
};

var GameLayer = cc.Layer.extend({
    space:null,
    arrayBloques:[],
    spriteFondo: null,
    spriteLinea: null,
    spriteBarra: null,
    spriteSiguiente: null,
    panel:null,
    alturaLinea: null,
    alturaBarra: null,
    mensaje: null,
    animalSiguiente: null,
    ctor:function () {
        this._super();
        var size = cc.winSize;

        // ZONA DE CACHE.
        cc.spriteFrameCache.addSpriteFrames(res.barra_3_plist);
        cc.spriteFrameCache.addSpriteFrames(res.animacioncocodrilo_plist);
        cc.spriteFrameCache.addSpriteFrames(res.animacionpanda_plist);
        cc.spriteFrameCache.addSpriteFrames(res.animaciontigre_plist);

        // Inicializar el espacio
        this.space = new cp.Space();
        this.space.gravity = cp.v( 0, -350);

        // Avisadores de colisiones
        this.space.addCollisionHandler(tipoMuro, tipoBloque, null, null, this.collisionBloqueConMuro.bind(this), null);
        this.space.addCollisionHandler(tipoBloque, tipoBloque, null, null, this.collisionBloqueConBloque.bind(this), null);

        // Muros
        var muroIzquierda = new cp.SegmentShape(this.space.staticBody,
            cp.v(0, 0),// Punto de Inicio
            cp.v(0, size.height),// Punto final
            10);// Ancho del muro
        this.space.addStaticShape(muroIzquierda);
        var muroArriba = new cp.SegmentShape(this.space.staticBody,
            cp.v(0, size.height),// Punto de Inicio
            cp.v(size.width, size.height),// Punto final
            10);// Ancho del muro
        this.space.addStaticShape(muroArriba);
        var muroDerecha = new cp.SegmentShape(this.space.staticBody,
            cp.v(size.width, 0),// Punto de Inicio
            cp.v(size.width, size.height),// Punto final
            10);// Ancho del muro
        this.space.addStaticShape(muroDerecha);
        var muroAbajo = new cp.SegmentShape(this.space.staticBody,
            cp.v(0, 0),// Punto de Inicio
            cp.v(size.width, 0),// Punto final
            10);// Ancho del muro
        muroAbajo.setFriction(1);
        muroAbajo.setCollisionType(tipoMuro);
        this.space.addStaticShape(muroAbajo);

        // Fondo
        this.spriteFondo = cc.Sprite.create(res.fondo_png);
        this.spriteFondo.setPosition(cc.p(size.width/2 , size.height/2));
        this.spriteFondo.setScale( size.width / this.spriteFondo.width );
        this.addChild(this.spriteFondo);

        // Niveles de difficultad
        switch (difficulty) {
            case difficulty_level.EASY:
                this.alturaLinea = size.height*0.6;
                this.alturaBarra = size.height*0.4;
                this.mensaje = "FÁCIL";
                break;
            case difficulty_level.MEDIUM:
                this.alturaLinea = size.height*0.7;
                this.alturaBarra = size.height*0.3;
                this.mensaje = "MEDIO";
                break;
            case difficulty_level.HARD:
                this.alturaLinea = size.height*0.8;
                this.alturaBarra = size.height*0.2;
                this.mensaje = "DIFÍCIL";
                break;
            default:
                break;
        }

        // Panel
        this.panel = cc.LabelTTF.create("", "Arial", 20, cc.TEXT_ALIGNMENT_CENTER, cc.TEXT_ALIGNMENT_CENTER);
        this.panel.setPosition(size.width*0.2,cc.winSize.height/2);
        this.panel.setString(this.mensaje + "\nApila los animales hasta\nla línea de puntos\n\nCada animal tiene distinto peso:\n"+
                                "Koala: 10 Kg\nMono: 50 Kg\nPanda: 100 Kg\nTigre: 200 Kg\nCocodrilo: 800 Kg\n\n"+
                                "Siguiente animal:");
        this.panel.setColor(cc.color.BLUE);
        this.addChild(this.panel);

        // Linea de puntos
        this.spriteLinea = cc.Sprite.create(res.linea_png);
        this.spriteLinea.setPosition(cc.p(size.width*0.7 , this.alturaLinea));
        this.spriteLinea.setScaleX( 1/10 );
        this.spriteLinea.setScaleY( 1/50 );
        this.addChild(this.spriteLinea);

        // Agregar BARRA
        this.spriteBarra = new cc.PhysicsSprite("#barra_3.png");
        // body - cuerpo ES ESTATICO
        var body = new cp.StaticBody();
        body.p = cc.p( size.width*0.7  , this.alturaBarra );
        this.spriteBarra.setBody(body);
        // Forma
        var shape = new cp.BoxShape(body, this.spriteBarra.width, this.spriteBarra.height);
        shape.setFriction(10);
        this.space.addShape(shape); // adStaticShape sí son estaticos
        // Agregar el Sprite fisico
        this.addChild(this.spriteBarra);

        // Evento MOUSE
        cc.eventManager.addListener({
            event: cc.EventListener.MOUSE,
            onMouseDown: this.procesarMouseDown
        }, this);

        this.nuevoAnimal();

        this.scheduleUpdate();
        return true;

    },procesarMouseDown:function(event) {

        var instancia = event.getCurrentTarget();

        // Comprueba si el bloque se puede crear
        var canI = true;
        for(var i = 0; i < instancia.arrayBloques.length; i++) {
            if (instancia.arrayBloques[i].body.getPos().y > instancia.alturaLinea){
                canI = false;
            }
        }
        if (canI){
            // Crea el sprite
            switch (instancia.animalSiguiente){
                case animales.PANDA:
                    var spriteBloque = new cc.PhysicsSprite("#panda1.png");
                    var body = new cp.Body(1, cp.momentForBox( 100, spriteBloque.width, spriteBloque.height )  );
                    break;
                case animales.COCODRILO:
                    var spriteBloque = new cc.PhysicsSprite("#cocodrilo1.png");
                    var body = new cp.Body(1, cp.momentForBox( 800, spriteBloque.width, spriteBloque.height )  );
                    break;
                case animales.TIGRE:
                    var spriteBloque = new cc.PhysicsSprite("#tigre1.png");
                    var body = new cp.Body(1, cp.momentForBox( 200, spriteBloque.width, spriteBloque.height )  );
                    break;
                case animales.KOALA:
                    var spriteBloque = new cc.PhysicsSprite(res.koala_1_png);
                    var body = new cp.Body(1, cp.momentForBox( 10, spriteBloque.width, spriteBloque.height )  );
                    break;
                case animales.MONO:
                    var spriteBloque = new cc.PhysicsSprite(res.mono_4_png);
                    var body = new cp.Body(1, cp.momentForBox( 50, spriteBloque.width, spriteBloque.height )  );
                    break;
                default:
                    break;
            }

            // body - cuerpo
            body.p = cc.p( event.getLocationX()  , event.getLocationY() );
            spriteBloque.setBody(body);
            instancia.space.addBody(body);

            // Forma
            var shape = new cp.BoxShape(body, spriteBloque.width, spriteBloque.height);
            shape.setFriction(1);
            instancia.space.addShape(shape);
            shape.setCollisionType(tipoBloque);

            // Agregar el Sprite fisico
            instancia.addChild(spriteBloque);
            instancia.arrayBloques.push(spriteBloque);

            // Siguiente animal aleatorio
            instancia.nuevoAnimal();

        }

    },vaciarArray:function () {
        while (this.arrayBloques.length > 0) {
              this.arrayBloques.pop();
        }

    },nuevoAnimal:function () {
        // Gestiona el sprite del siguiente animal
        if (this.spriteSiguiente) {
            // Si hay un animal previo, elimina su sprite
            this.removeChild(this.spriteSiguiente);
        }
        // Genera aleatoriamente un animal
        this.animalSiguiente = Math.floor((Math.random() * 5) + 1);

        // Elige la imagen adecuada al animal
        switch (this.animalSiguiente){
            case animales.PANDA:
                this.spriteSiguiente = cc.Sprite.create("#panda1.png");
                break;
            case animales.COCODRILO:
                this.spriteSiguiente = cc.Sprite.create("#cocodrilo1.png");
                break;
            case animales.TIGRE:
                this.spriteSiguiente = cc.Sprite.create("#tigre1.png");
                break;
            case animales.KOALA:
                this.spriteSiguiente = cc.Sprite.create(res.koala_1_png);
                break;
            case animales.MONO:
                this.spriteSiguiente = cc.Sprite.create(res.mono_4_png);
                break;
            default:
                break;
        }
        // Agrega el sprite
        this.spriteSiguiente.setPosition(cc.winSize.width*0.2,cc.winSize.height/9);
        this.addChild( this.spriteSiguiente );

    },update:function (dt) {
        this.space.step(dt);

    },collisionBloqueConMuro:function (arbiter, space) {
        // Vacía el array de bloques y reinicia el nivel
        this.vaciarArray();
        cc.director.runScene(new GameScene());

    },collisionBloqueConBloque:function (arbiter, space) {
        var shapes = arbiter.getShapes();
        // Comprobar si hemos superado la linea de puntos
        if ((shapes[1].body.getPos().y || shapes[0].body.getPos().y) > this.alturaLinea){
            if (difficulty != difficulty_level.HARD) {
                difficulty = difficulty + 1;
                this.vaciarArray();
                cc.director.runScene(new GameScene());
            } else {
                this.panel.setString("¡HAS GANADO!");
            }
        }
    }
});

var GameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        cc.director.resume();
        //cc.audioEngine.playMusic(res.sonidobucle_wav, true);
        var layer = new GameLayer();
        this.addChild(layer);
    }
});

