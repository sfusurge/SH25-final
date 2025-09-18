<script lang="ts">
    let { faqData = [
        {
            question: "What is StormHacks?",
            answer: `StormHacks is one of Canada's largest student hackathons, where participants from different backgrounds and all skill levels come together to collaborate, innovate, and create unique design, software or hardware projects from the ground up. \n
Within just 36 hours, teams bring their ideas to life. We empower and enable teams by providing an abundance of workshops, mentors, sponsors, and hardware. StormHacks fosters creativity, learning, and teamwork in an energetic, inclusive environment.`
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
            question: "How many people can be on a team?",
            answer: "Hackers may form teams of up to 4 people. There are no restrictions for who they can be, so you can team up with hackers from any school or experience level! Teams can be formed before or during the event at the hackers' own discretion. Just be sure that everyone on the team is in attendance at the event."
        },
        {
            question: "What kind of workshops, talks and activities will there be?",
            answer: "Previously, we've held workshops and talks for a range of skill levels from beginner to advanced like 'Intro to React' and 'Exploring Data Science with Pandas and SKlearn'. We've also hosted sessions that explore various topics such as design fundamentals, effective pitching, and product management.\n\n Additionally, there will be interactive activities such as meetups, networking events and even esports tournaments to keep participants engaged throughout the weekend. Our team has prepared something for everyone to enjoy!"
        },
        {
            question: "Do you offer travel reimbursements?",
            answer: "Unfortunately, we are unable to offer travel reimbursements at this time. However, StormHacks 2025 is easily accessible by public transit and we encourage participants to explore different options to make attending more convenient."
        },
        {
            question: "I'm not currently enrolled as a student, can I still attend StormHacks?",
            answer: "StormHacks is geared towards students who are interested in tech, but we want to open doors for anyone who wants to learn. We ask that all applicants are still enrolled in school or are recent graduates within the last 4 months."
        }
    ] } = $props();

    let flippedCards = $state({});

    function toggleFlip(index) {
        flippedCards[index] = !flippedCards[index];
        flippedCards = { ...flippedCards }; // Trigger reactivity
    }
</script>

<div class="w-full flex items-center justify-center">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center py-0 p-10 lg:p-12 w-full max-h-[100dvh] overflow-y-auto">
        {#each faqData as faq, index}
            <div
                class="flip-card w-full max-w-xs lg:max-w-sm h-80 cursor-pointer"
                role="button"
                tabindex="0"
                onclick={() => toggleFlip(index)}
                onkeydown={(e) => e.key === 'Enter' || e.key === ' ' ? toggleFlip(index) : null}
            >
                <div class="flip-card-inner w-full h-full" class:flipped={flippedCards[index]}>
                    <div class="flip-card-front flex px-5 lg:px-8 flex-col justify-center items-center gap-2.5 flex-shrink-0 w-full h-full text-pretty">
                        <p class="text-[#F1ECEB] text-center text-[15px] italic font-bold leading-normal">
                            {faq.question}
                        </p>
                        <p class="text-[#A7928E] text-center text-[8px] italic font-normal leading-normal">
                            [Click For Answer]
                        </p>
                    </div>

                    <div class="text-start flip-card-back px-6 py-2 flex flex-col justify-center items-center gap-2.5 flex-shrink-0 w-full h-full text-pretty">
                        <h1 class="text-header text-sm italic self-stretch leading-normal font-bold">
                            {faq.question}
                        </h1>
                        <h3 class="text-textalt text-[12px] italic font-normal leading-normal whitespace-pre-line">
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

    /* Custom scrollbar styling */
    .grid::-webkit-scrollbar {
        width: 8px;
    }

    .grid::-webkit-scrollbar-track {
        background: rgba(87, 78, 73, 0.3);
        border-radius: 4px;
    }

    .grid::-webkit-scrollbar-thumb {
        background: #574E49;
        border-radius: 4px;
    }

    .grid::-webkit-scrollbar-thumb:hover {
        background: #A7928E;
    }

    /* Firefox scrollbar */
    .grid {
        scrollbar-width: thin;
        scrollbar-color: #574E49 rgba(87, 78, 73, 0.3);
    }
</style>