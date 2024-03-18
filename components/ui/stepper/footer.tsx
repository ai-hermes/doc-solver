/**
 * not shadcn-ui's official comp
 * copy form https://github.com/shadcn-ui/ui/pull/318/files#diff-363db0985f3617fc0863ca85793dada90477b817e681a66020a7b50b97aa4358
 */
import { Button } from "@/components/ui/button"
import {
  useStepper,
} from "@/components/ui/stepper"

export default function StepperFooter() {
  const {
    activeStep,
    isLastStep,
    isOptionalStep,
    isDisabledStep,
    nextStep,
    prevStep,
    resetSteps,
    steps,
  } = useStepper()

  return (
    <div className="flex items-center justify-end gap-2">
      {activeStep === steps.length ? (
        <>
          <Button onClick={resetSteps}>Reset</Button>
        </>
      ) : (
        <>
          <Button disabled={isDisabledStep} onClick={prevStep}>
            Prev
          </Button>
          <Button onClick={nextStep}>
            {isLastStep ? "Finish" : isOptionalStep ? "Skip" : "Next"}
          </Button>
        </>
      )}
    </div>
  )
}
