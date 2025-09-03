<script>
    export let faqData = [
        {
            question: "What is StormHacks?",
            answer: "StormHacks is one of Canada's largest student hackathons, where participants from different backgrounds and all skill levels come together to collaborate, innovate, and create unique design, software or hardware projects from the ground up."
        },
        {
            question: "Who can participate?",
            answer: "Students from all backgrounds and any education level are encouraged to apply!"
        },
        {
            question: "How much does it cost to attend StormHacks?",
            answer: "Admission to StormHacks is completely free! We provide everyone with food and overnight accommodation for the entire event on top of the resources and mentorship hackers need to innovate."
        },
        {
            question: "What if I've never been to a hackathon before?",
            answer: "StormHacks welcomes students of all skill levels and backgrounds. Many students attend StormHacks as their very first hackathon and they always come back yearning for more!"
        },
        {
            question: "Will StormHacks 2025 happen in person or virtually?",
            answer: "StormHacks will be an in-person hackathon hosted at Simon Fraser University on the Burnaby Mountain Campus."
        },
        {
            question: "When do hacker applications open?",
            answer: "We'll be opening hacker applications in the coming weeks. Sign up for our mailing list and follow our social media channels to be the first to hear about any exciting updates!"
        }
    ];

    let flippedCards = {};

    function toggleFlip(index) {
        flippedCards[index] = !flippedCards[index];
        flippedCards = { ...flippedCards }; // Trigger reactivity
    }
</script>

<div class="w-full flex items-center justify-center">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {#each faqData as faq, index}
            <div
                class="flip-card w-[270px] h-[338px] cursor-pointer"
                role="button"
                tabindex="0"
                on:click={() => toggleFlip(index)}
                on:keydown={(e) => e.key === 'Enter' || e.key === ' ' ? toggleFlip(index) : null}
            >
                <div class="flip-card-inner" class:flipped={flippedCards[index]}>
                    <div class="flip-card-front flex px-16 flex-col justify-center items-center gap-2.5 flex-shrink-0">
                        <p class="text-[#F1ECEB] text-center text-[15px] italic font-bold leading-normal">
                            {faq.question}
                        </p>
                        <p class="text-[#A7928E] text-center text-[8px] italic font-normal leading-normal">
                            [Click For Answer]
                        </p>
                    </div>

                    <div class="text-start flip-card-back px-6 py-2 flex flex-col justify-center items-center gap-2.5 flex-shrink-0">
                        <h1 class="text-header text-sm italic self-stretch leading-normal font-bold">
                            {faq.question}
                        </h1>
                        <h3 class="text-textalt text-[12px] italic font-normal leading-normal">
                            {faq.answer}
                        </h3>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>


<style>
    .flip-card {
        perspective: 1000px;
    }

    .flip-card-inner {
        position: relative;
        width: 100%;
        height: 100%;
        text-align: center;
        transition: transform 0.6s;
        transform-style: preserve-3d;
    }

    .flip-card-inner.flipped {
        transform: rotateY(180deg);
    }

    .flip-card-front, .flip-card-back {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        border: 1px solid #574E49;
        background: #161414;
        backdrop-filter: blur(5px);
    }

    .flip-card-back {
        transform: rotateY(180deg);
    }

    .flip-card:hover .flip-card-inner {
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    }
</style>