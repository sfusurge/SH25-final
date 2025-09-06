export interface SlotPosition {
    left: string; // percent of background, e.g., '32%'
    top: string;  // percent of background, e.g., '25%'
    width?: string; // optional width for the customer, e.g., '8%'
}

export interface CustomerSlot {
    position: SlotPosition;          // desktop position/size
    mobilePosition?: SlotPosition;   // mobile overrides (<640px)
    mobileNarrowPosition?: SlotPosition; // extra-narrow overrides (<400px)
    orderGapY?: string;              // desktop bubble gap, e.g., '5%'
    mobileOrderGapY?: string;        // mobile bubble gap, e.g., '6%'
    mobileNarrowOrderGapY?: string;  // extra-narrow bubble gap
    orderWidth?: string;
    mobileOrderWidth?: string;
    mobileNarrowOrderWidth?: string;
    orderTransform?: string;           
    mobileOrderTransform?: string;
    mobileNarrowOrderTransform?: string;
}

// Customer manual positioning
export const customerSlots: CustomerSlot[] = [
    {
        position: { left: '32%', top: '25%', width: '8%' },
        mobilePosition: { left: '10%', top: '23%', width: '14%' },
        mobileNarrowPosition: { left: '8%', top: '27%', width: '16%' },
        orderGapY: '5%',
        mobileOrderGapY: '6%',
        mobileNarrowOrderGapY: '7%',
        // Order bubble overrides (optional)
        orderWidth: '5%',
        orderTransform: 'translate(-50%, -110%)',
        mobileOrderWidth: '7cqw',
        mobileNarrowOrderWidth: '7cqw',
        mobileOrderTransform: 'translate(-30%, -120%)'
    },
    {
        position: { left: '47%', top: '22%', width: '8%' },
        mobilePosition: { left: '42%', top: '20%', width: '14%' },
        mobileNarrowPosition: { left: '42%', top: '25%', width: '16%' },
        orderGapY: '5%',
        mobileOrderGapY: '6%',
        mobileNarrowOrderGapY: '7%',
        orderWidth: '5%',
        orderTransform: 'translate(-50%, -110%)',
        mobileOrderWidth: '7cqw',
        mobileNarrowOrderWidth: '7cqw',
        mobileOrderTransform: 'translate(-30%, -110%)'
    },
    {
        position: { left: '60%', top: '25%', width: '8%' },
        mobilePosition: { left: '68%', top: '22%', width: '14%' },
        mobileNarrowPosition: { left: '70%', top: '27%', width: '16%' },
        orderGapY: '5%',
        mobileOrderGapY: '6%',
        mobileNarrowOrderGapY: '7%',
        orderWidth: '5%',
        orderTransform: 'translate(-50%, -110%)',
        mobileOrderWidth: '7cqw',
        mobileNarrowOrderWidth: '7cqw',
        mobileOrderTransform: 'translate(-30%, -120%)'
    }
];


