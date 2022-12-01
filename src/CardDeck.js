import React, {useState, useRef, useEffect} from 'react'
import axios from 'axios';
import Card from './Card';

const BASE_URL = 'https://deckofcardsapi.com/api/deck'

const CardDeck = ({props}) => {
    const [deck, setDeck] = useState(null)
    const [drawn, setDrawn] = useState([]);
    const [autoDraw, setAutoDraw] = useState(false);
    const timerRef = useRef(null)

    useEffect(() =>{
        async function getDeck(){
            const deckRes = await axios.get(`${BASE_URL}/new/shuffle/`)
            console.log(deckRes)
            setDeck(deckRes.data)
        };
        getDeck()
    }, [setDeck])
    
    useEffect(() => {
        async function drawCard() {
            let { deck_id } = deck;

            try{
                let cardRes = await axios.get(`${BASE_URL}/${deck_id}/draw/`)

                if(cardRes.data.remaining === 0){
                    setAutoDraw(false);
                    throw new Error('No Cards Remaining')
                }

                const card = cardRes.data.cards[0];

                setDrawn(d => [
                    ...d, {
                        id: card.code,
                        name: card.suit + " " + card.value,
                        image: card.image
                    }
                ]);
            }catch(err){
                alert(err)
            }
        }

        if(autoDraw && !timerRef.current) {
            timerRef.current = setInterval(async () => {
                await drawCard();
            }, 1000);
        }

        return () => {
            clearInterval(timerRef.current);
            timerRef.current = null;
        };
    }, [autoDraw, setAutoDraw, deck]);

    const toggleAutoDraw = () => {
        setAutoDraw(auto => !auto);
    };

    const cards = drawn.map(c => (
        <Card key={c.id} name={c.name} image={c.image} />
    ))

    return (
        <div>
            {deck ? (
                <button className='Deck-draw' onClick={toggleAutoDraw}>{autoDraw ? 'STOP' : 'KEEP'} DRAW FOR ME</button>
            ) : null}
            <div className='Deck-cardArea'>{cards}</div>
        </div>
    )
}

export default CardDeck