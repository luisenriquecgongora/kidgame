class Observable {
  constructor() {
    this.observers = [];
  }
  subscribe(f) {
    this.observers.push(f);
  }

  unsubscribe(f) {
    this.observers = this.observers.filter(subscriber => subscriber !== f);
  }
  notify(data) {
    this.observers.forEach(observer => observer(data));
  }
}

$(function() {
    //Words generated in https://www.randomwordgenerator.com/
    let data = {
        words : [
          "expectation","central","abundant","revive","teach","pattern","redeem","assembly","aware","eagle","recommendation","castle","nonsense","linear","sale","plagiarize","persist","frank","blackmail","fossil","plaster","hardship","dividend","dilute",
          "polite","calm","quit","weigh","partnership","impulse","exclude","sketch","restless","shorts","coalition","desk","impact","size","socialist","promotion","thesis","memory","permission","cutting","childish","wife","kit","bread","sanctuary",
          "trait","memorial","feature","promise","tense","lay","undress","tourist","officer","bike","snub","provincial","hunting","inflate","delay","salvation","rubbish","arch","mole","extinct","stubborn","species","negligence","chord","pyramid",
          "coincidence","sport","velvet","cable","elephant","cultivate","executrix","pause","compartment","decline","comprehensive","entertain","tract","bang","matrix","redundancy","money","return","motif","cruel","breakdown","certain","notice","speech","nightmare",
          "lose"
        ],
        currentWord: "",
        testWord: "",
        points : 0.0,
        level: 0,
        timer: 110,
        maxTime: 120,
        maxMargin: 15,
        wrongPointValue: 0.5,
        maxPointValue: 100.0
    };

    var octopus = {
        // GETTERS
        getTestWord: function(){
          return data.testWord;
        },

        getCurrentWord: function() {
          return data.currentWord;
        },

        getPoints(){
          return data.points;
        },
        getLevel(){
          return data.level;
        },

        // SETTERS
        setMaxPointValue(val){
          data.maxPointValue= parseInt(val);
        },

        // ACTUATORS
        selectLetter: async function(val) {
            let currentWord = data.currentWord;
            let letter2Verify = data.testWord.substring(currentWord.length,currentWord.length+1)
            let newWord = "";
            if(val == 'del'){
              data.points = data.points - 1
            }
            else if(letter2Verify == val){
              data.points = data.points + 1
            }
            else if(letter2Verify !== val){
              data.points = data.points - data.wrongPointValue
            }
            if(val !== 'del'){
              newWord = currentWord.concat(val);
            }else{
              newWord = currentWord.substring(0,currentWord.length-1)
            }
            data.currentWord = newWord;
            this.verifyWord();
            return false;
        },

        // VERIFIERS
        verifyWord: function(){
          if(data.testWord == data.currentWord){
            swal({
              title: `Word: ${data.testWord} +${data.testWord.length + 2} points`,
              text: `You wrote correctly the word: ${data.testWord}`,
              icon: "success",
              buttons: false,
              timer: 1000
            });
            data.points = data.points + 2;
            data.level = Math.floor(data.points / 10.0);
            data.currentWord = "";
            data.timer = 10;
            this.generateTestWord();
            if(data.maxPointValue<= data.points){
              this.stopTimer();
              swal({
                title: `AWESOME!`,
                text: `You passed all the tests!`,
                icon: "success",
                buttons: false,
              });
            }
          }
        },

        // GENERATORS
        generateTestWord: async function() {
          let initialNumberOfLetters = 4;
          let wordsList = data.words;
          let nOfLetters = data.level + initialNumberOfLetters;
          let possibleWords = wordsList.filter((word)=>{
            return (word.length <= nOfLetters)
          });
          data.testWord = possibleWords[Math.floor(Math.random() * possibleWords.length)];
          return false;
        },

        // TIME CONTROLLERS
        initializeTimer(timeObservable, wordObservable, positionObservable){
          let counterInterval = setInterval(function(){
            let currentTime = data.timer;
            if(currentTime==0){
              data.timer = data.maxTime;
              octopus.generateTestWord();
              wordObservable.notify(data.testWord)
            }else{
              currentTime--;
              data.timer = currentTime;
            }
            positionObservable.notify(`${(data.maxTime - 1*currentTime) * data.maxMargin/data.maxTime}vh`);
            timeObservable.notify(data.timer);
          }, 100);
          data.counterInterval = counterInterval;
        },

        stopTimer(){
          clearInterval(data.counterInterval);
        },

        // INITIALIZERS
        init: function() {
            this.generateTestWord();
            view.init();
        }
    };


    var view = {
        init: function() {
            // GRAB ALL OF THE REFERENCES TO THE DOM
            this.$wordWritten = $('#word-written');
            this.$wordTest = $('#word-test');
            this.$keyList = $('.keyboard-row');
            this.$pointsCounter = $('#points-counter');
            this.$levelCounter = $('#level-counter');
            this.$timeCounter = $('#time-counter');
            this.$begginerSelector = $('#begginer-selector');
            this.$advancedSelector = $('#advanced-selector');
            this.$gameTypeSelector = $('#game-type-selector');
            this.$maxPointInput = $('input[name=input-max-point]');

            // CONTROL THE EVENT WHEN THE USER SELECTS BEGINNER MODE
            let $gameTypeSelector = this.$gameTypeSelector;
            this.$begginerSelector.on('click', function(e) {
              e.preventDefault();
              $gameTypeSelector.css('display','none');
            });

            // CONTROL THE EVENT WHEN THE USER SELECTS ADVANCED MODE
            this.$advancedSelector.on('click', function(e) {
              e.preventDefault();
              $gameTypeSelector.css('display','none');
              view.initializeTimerView();
            });

            // CONTROL THE EVENT WHEN THE USER INPUTS MAXIMUM Nº OF POINTS
            this.$maxPointInput.on("input",function(e){
              octopus.setMaxPointValue(e.target.value);
            })

            // CONTROL THE EVENT WHEN THE USER SELECTS A LETTER (REAL KEYBOARD)
            document.addEventListener("keydown",async function (e) {
              if(e.keyCode == 8){
                await octopus.selectLetter('del');
                view.render();
              }else{
                let character = String.fromCharCode(e.keyCode).toLowerCase();
                if(character.length === 1 && character.match(/[a-z]/i)){
                  await octopus.selectLetter(character);
                  view.render();
                }
              }
            });

            // CONTROL THE EVENT WHEN THE USER SELECTS A LETTER (VIRTUAL KEYBOARD)
            this.$keyList.on('click', '.key', async function(e) {
                let key = $(this)[0].id;
                await octopus.selectLetter(key);
                view.render();
            });
            view.render();
        },

        initializeTimerView: function() {
          const updateClock = time => this.$timeCounter.html(`${Math.floor(time/10)}:${Math.floor((time%10)*60/10)}`);
          const updateWord = word => this.$wordTest.html(word);
          const updateTesWordPositions = position => this.$wordTest.css('margin-top',position);
          const timeObservable = new Observable();
          const wordObservable = new Observable();
          const positionObservable = new Observable();
          timeObservable.subscribe(updateClock);
          wordObservable.subscribe(updateWord);
          positionObservable.subscribe(updateTesWordPositions);
          octopus.initializeTimer(timeObservable, wordObservable, positionObservable);
        },

        render: function() {
          let testWord = octopus.getTestWord();
          let currentWord = octopus.getCurrentWord();
          let points = octopus.getPoints();
          let level = octopus.getLevel();
          this.$wordTest.html(testWord);
          this.$wordWritten.html(currentWord);
          this.$pointsCounter.html(`Points: ${points}`);
          this.$levelCounter.html(`Level: ${level}`);
        }
    };
    octopus.init();
}());
