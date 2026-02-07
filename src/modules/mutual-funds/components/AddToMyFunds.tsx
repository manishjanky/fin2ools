import React, { Suspense, useState } from "react";
import { useInvestmentStore } from "../store";
import type { MutualFundScheme } from "../types/mutual-funds";
import AddInvestmentModal from "./AddInvestmentModal";

export default function AddToMyFunds({ scheme, label, onClose }: { scheme: MutualFundScheme, label?: string, onClose?: () => void }) {

    const [showModal, setShowModal] = useState(false);

    const { addInvestment } = useInvestmentStore();

    const handleAddInvestment = (investment: any) => {
        addInvestment(scheme.schemeCode, investment);
        setShowModal(false);
        onClose && onClose();
    };
    const add = ($event: React.MouseEvent) => {
        $event.stopPropagation();
        setShowModal(true);
    };

    const onModalClose = () => {
        setShowModal(false);
        onClose && onClose();
    }

    return (
        <div className='flex justify-end'>
            <label
                role='button'
                onClick={add}
                className="w-full md:w-auto p-1 text-md text-primary hover:text-primary-dark cursor-pointer transition text-center font-bold"
            >
                {label || "+ Add to My Funds"}
            </label>
            <Suspense>
                <AddInvestmentModal
                    isOpen={showModal}
                    onClose={onModalClose}
                    onSubmit={handleAddInvestment}
                    schemeName={scheme.schemeName}
                    schemeCode={scheme.schemeCode}
                />
            </Suspense>

        </div>
    );
}