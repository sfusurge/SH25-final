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

// Default values for common properties
const defaultCustomerSlot: Partial<CustomerSlot> = {
    orderGapY: '5%',
    mobileOrderGapY: '6%',
    mobileNarrowOrderGapY: '7%',
    orderWidth: '5%',
    orderTransform: 'translate(-50%, -110%)',
    mobileOrderWidth: '7cqw',
    mobileNarrowOrderWidth: '7cqw',
};

// Common widths
const widths = {
    desktop: '10%',
    mobile: {
        normal: '17%',
        narrow: '22%'
    }
};

// Helper function to create customer slot with defaults
function createCustomerSlot(overrides: Partial<CustomerSlot>): CustomerSlot {
    return { ...defaultCustomerSlot, ...overrides } as CustomerSlot;
}

// Customer manual positioning - only specify unique values
export const customerSlots: CustomerSlot[] = [
    createCustomerSlot({
        position: { left: '24%', top: '25%', width: widths.desktop },
        mobilePosition: { left: '10%', top: '25%', width: widths.mobile.normal },
        mobileNarrowPosition: { left: '8%', top: '28%', width: widths.mobile.narrow },
        mobileOrderTransform: 'translate(-30%, -120%)'
    }),
    createCustomerSlot({
        position: { left: '46%', top: '22%', width: widths.desktop },
        mobilePosition: { left: '42%', top: '23%', width: widths.mobile.normal },
        mobileNarrowPosition: { left: '42%', top: '25%', width: widths.mobile.narrow },
        mobileOrderTransform: 'translate(-30%, -120%)'
    }),
    createCustomerSlot({
        position: { left: '65%', top: '25%', width: widths.desktop },
        mobilePosition: { left: '68%', top: '25%', width: widths.mobile.normal },
        mobileNarrowPosition: { left: '70%', top: '28%', width: widths.mobile.narrow },
        mobileOrderTransform: 'translate(-30%, -120%)'
    })
];


