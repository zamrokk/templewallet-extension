import React, { useState } from "react";

import Stepper from "app/atoms/Stepper";
import PageLayout from "app/layouts/PageLayout";
import ApproveStep from "app/pages/BuyCrypto/steps/ApproveStep";
import ExchangeStep from "app/pages/BuyCrypto/steps/ExchangeStep";
import InitialStep from "app/pages/BuyCrypto/steps/InitialStep";
import { exchangeDataInterface } from "lib/exolix";
import { T, t } from "lib/i18n/react";
import { useAccount, useNetwork, useStorage } from "lib/temple/front";
import { Redirect } from "lib/woozie";

const steps = [
  {
    label: `${t("step")} 1`,
  },
  {
    label: `${t("step")} 2`,
  },
  {
    label: `${t("step")} 3`,
  },
  {
    label: `${t("step")} 4`,
  },
];

const BuyCrypto = () => {
  const network = useNetwork();
  const { publicKeyHash } = useAccount();
  const [step, setStep] = useStorage<number>(
    `topup_step_state_${publicKeyHash}`,
    4
  );
  const [isError, setIsError] = useState(false);
  const [exchangeData, setExchangeData] =
    useStorage<exchangeDataInterface | null>(
      `topup_exchange_data_state_${publicKeyHash}`,
      null
    );
  if (network.type !== "main") {
    return <Redirect to={"/"} />;
  }

  return (
    <PageLayout
      pageTitle={
        <>
          <T id="buyWithCrypto" />
        </>
      }
    >
      <div
        style={{ maxWidth: "360px", margin: "auto" }}
        className="text-center"
      >
        <Stepper
          style={{ marginTop: "64px" }}
          steps={steps}
          currentStep={step}
        />
        {step === 0 && (
          <InitialStep
            isError={isError}
            setIsError={setIsError}
            exchangeData={exchangeData}
            setExchangeData={setExchangeData}
            step={step}
            setStep={setStep}
          />
        )}
        {step === 1 && (
          <ApproveStep
            exchangeData={exchangeData}
            setExchangeData={setExchangeData}
            setStep={setStep}
            step={step}
            isError={isError}
            setIsError={setIsError}
          />
        )}
        {(step === 2 || step === 3 || step === 4) && (
          <ExchangeStep
            exchangeData={exchangeData}
            setExchangeData={setExchangeData}
            setStep={setStep}
            step={step}
            isError={isError}
            setIsError={setIsError}
          />
        )}
        {step >= 1 && (
          <p
            className="text-blue-500 text-sm mb-8 cursor-pointer inline-block w-auto"
          >
            <T id={"support"} />
          </p>
        )}
      </div>
    </PageLayout>
  );
};

export default BuyCrypto;
