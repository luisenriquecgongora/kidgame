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
        points : 0,
        level: 0,
        timer: 110,
        maxTime: 120,
        maxMargin: 15,//vh
        wrongPunctiation: 0.5,
        maxPunctiation: 100
    };

    class Observable {
      constructor() {
        this.observers = [];
      }

      // add the ability to subscribe to a new object / DOM element
      // essentially, add something to the observers array
      subscribe(f) {
        this.observers.push(f);
      }

      // add the ability to unsubscribe from a particular object
      // essentially, remove something from the observers array
      unsubscribe(f) {
        this.observers = this.observers.filter(subscriber => subscriber !== f);
      }

      // update all subscribed objects / DOM elements
      // and pass some data to each of them
      notify(data) {
        this.observers.forEach(observer => observer(data));
      }
    }

    var octopus = {
        generateTestWord: async function() {
          let wordsList = data.words;
          let nOfLetters = data.level + 4;
          let possibleWords = wordsList.filter((word)=>{
            return (word.length <= nOfLetters)
          });
          data.testWord = possibleWords[Math.floor(Math.random() * possibleWords.length)];
          return false;
        },

        getTestWord: function(){
          return data.testWord;
        },

        getCurrentWord: function() {
          return data.currentWord;
        },

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
            this.generateTestWord();
            data.currentWord = "";
            data.timer = 10;
            if(data.maxPunctiation <= data.points){
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
        getPoints(){
          return data.points;
        },
        getLevel(){
          return data.level;
        },
        setMaxPunctuation(val){
          data.maxPunctiation = parseInt(val);
        },
        stopTimer(){
          clearInterval(data.counterInterval);
        },
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
        selectLetter: async function(val) {
            let currentWord = data.currentWord;
            //console.log("Curent Word is: " + currentWord)
            //console.log("Written letter: " + val);
            let letter2Verify = data.testWord.substring(currentWord.length,currentWord.length+1)
            //console.log("Test letter " + letter2Verify)
            let newWord = "";
            if(val == 'del'){
              data.points = data.points - 1
            }
            else if(letter2Verify == val){
              data.points = data.points + 1
            }
            else if(letter2Verify !== val){
              data.points = data.points - data.wrongPunctiation
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

        init: function() {
            this.generateTestWord();
            view.init();
        }
    };


    var view = {
        init: function() {
            // grab elements and html for using in the render function
            this.$wordWritten = $('#word-written');
            this.$wordTest = $('#word-test');
            this.$keyList = $('.keyboard-row');
            this.$pointsCounter = $('#points-counter');
            this.$levelCounter = $('#level-counter');
            this.$timeCounter = $('#time-counter');
            this.$begginerSelector = $('#begginer-selector');
            this.$advancedSelector = $('#advanced-selector');
            this.$gameTypeSelector = $('#game-type-selector');
            this.$maxPunctiationInput = $('input[name=input-max-point]');
            let $gameTypeSelector = this.$gameTypeSelector
            this.$begginerSelector.on('click', function(e) {
              e.preventDefault();
              $gameTypeSelector.css('display','none');
                //this.initializeTimerView();
            });

            this.$maxPunctiationInput.on("input",function(e){
              octopus.setMaxPunctuation(e.target.value);
            })

            this.$advancedSelector.on('click', function(e) {
              e.preventDefault();
              $gameTypeSelector.css('display','none');
              view.initializeTimerView();
            });

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
