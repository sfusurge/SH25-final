// Simple plant data (no types/enums yet). Each plant lives under its bucket folder.

export const plantData = [
    {
        id: 1,
        key: 'plant1',
        imageSrc: '/assets/experiences/leaf/plant/plant1.png',
        altText: 'Monstera',
        // width uses vw; left/top inherit from bucket; adjust via transform
        position: {
            width: '22%',
            transform: 'translate(-57%, -88%)'
        },
        mobilePosition: {
            width: '40%',
            transform: 'translate(-57%, -88%)'
        },
        mobileVeryNarrowPosition: {
            width: '47%',
            transform: 'translate(-57%, -88%)'
        },
        points: 100,
    },
    {
        id: 2,
        key: 'plant2',
        imageSrc: '/assets/experiences/leaf/plant/plant2.png',
        altText: 'River Vine',
        position: {
            width: '63%',
            transform: 'translate(-40%, -42%)'
        },
        mobilePosition: {
            width: '150%',
            transform: 'translate(-40%, -42%)'
        },
        mobileVeryNarrowPosition: {
            width: '200%',
            transform: 'translate(-40%, -42%)'
        },
        points: 3000,
    },
    {
        id: 3,
        key: 'plant3',
        imageSrc: '/assets/experiences/leaf/plant/plant3.png',
        altText: 'Tomato',
        position: {
            width: '9.5%',
            transform: 'translate(-56%, -95%)'
        },
        mobilePosition: {
            width: '18%',
            transform: 'translate(-52%, -97%)'
        },
        mobileVeryNarrowPosition: {
            width: '20%',
            transform: 'translate(-52%, -97%)'
        },
        points: 20,
    },
    {
        id: 4,
        key: 'plant4',
        imageSrc: '/assets/experiences/leaf/plant/plant4.png',
        altText: 'Staff Stick',
        position: {
            width: '8%',
            transform: 'translate(-50%, -85%)'
        },
        mobilePosition: {
            width: '13%',
            transform: 'translate(-52%, -90%)'
        },
        mobileVeryNarrowPosition: {
            width: '15%',
            transform: 'translate(-52%, -90%)'
        },
        points: 5,
    },
    {
        id: 5,
        key: 'plant5',
        imageSrc: '/assets/experiences/leaf/plant/plant5.png',
        altText: 'Mega Carrot',
        position: {
            width: '10%',
            transform: 'translate(-50%, -97%)'
        },
        mobilePosition: {
            width: '20%',
            transform: 'translate(-52%, -96.55%)'
        },
        mobileVeryNarrowPosition: {
            width: '20%',
            transform: 'translate(-52%, -96.55%)'
        },
        points: 99999,
    },
    {
        id: 6,
        key: 'plant6',
        imageSrc: '/assets/experiences/leaf/plant/plant6.png',
        altText: 'Giant Dandelion',
        position: {
            width: '15%',
            transform: 'translate(-32%, -90%)'
        },
        mobilePosition: {
            width: '23%',
            transform: 'translate(-32%, -96.55%)'
        },
        mobileVeryNarrowPosition: {
            width: '25%',
            transform: 'translate(-35%, -96.55%)'
        },
        points: 250,
    }
];

export const plantKeys: string[] = plantData.map((p) => p.key);
