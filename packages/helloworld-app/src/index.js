import React, { useEffect, useState, useMemo } from 'react'
import styled from "styled-components"
import { observer } from 'mobx-react'
import { Button, Input, Spacer, useInput, useToasts } from '@zeit-ui/react'
import { Plus as PlusIcon } from '@zeit-ui/react-icons'

import { useStore } from "@/store"
import Container from '@/components/Container'
import UnlockRequired from '@/components/accounts/UnlockRequired'
import PushCommandButton from '@/components/PushCommandButton'

import { CONTRACT_HELLOWORLD, createHelloWorldAppStore } from './utils/AppStore'
import { reaction } from 'mobx'

const ButtonWrapper = styled.div`
  margin-top: 5px;
  width: 200px;
`;

/**
 * Header of the HelloWorld app page
 */
const AppHeader = () => (
  <Container>
    <h1>Secret Note</h1>
  </Container>
)

/**
 * Body of the HelloWorld app page
 */
const AppBody = observer(() => {
  const { appRuntime, helloworldApp } = useStore();
  const [, setToast] = useToasts()
  const { state: note, bindings } = useInput('')

    async function updateNote () {
        if (!helloworldApp) return
        try {
            const response = await helloworldApp.queryNote(appRuntime)
            // Print the response in the original to the console
            console.log('Response::GetNote', response);

            helloworldApp.setNote(response.GetNote.note)
        } catch (err) {
            setToast(err.message, 'error')
        }
    }

    const setNoteCommandPayload = useMemo(() => {
        return {
            SetNote: {
                note: note
            }
        }
    }, [note])

  return (
    <Container>
      <section>
        <div>PRuntime: {appRuntime ? 'yes' : 'no'}</div>
        <div>PRuntime ping: {appRuntime.latency || '+∞'}</div>
        <div>PRuntime connected: {appRuntime?.channelReady ? 'yes' : 'no'}</div>
      </section>
      <Spacer y={1}/>

        <h3>Secret Note</h3>
        <section>
            <div>Secret note value: {helloworldApp.note === null ? 'unknown' : helloworldApp.note}</div>
            <Spacer y={1}/>
            <div><Button onClick={updateNote}>Reveal</Button></div>
        </section>
        <Spacer y={1}/>

        <section>
            <div>
                <Input label="New secret note" {...bindings} />
            </div>
            <ButtonWrapper>
                {/**
                 * PushCommandButton is the easy way to send confidential contract txs.
                 * Below it's configurated to send HelloWorld::Increment()
                 */}
                <PushCommandButton
                    // tx arguments
                    contractId={CONTRACT_HELLOWORLD}
                    payload={setNoteCommandPayload}
                    // display messages
                    modalTitle='Remember my secret note'
                    modalSubtitle={`Setting secret note to '${note}'`}
                    onSuccessMsg='Tx succeeded'
                    // button appearance
                    buttonType='secondaryLight'
                    icon={PlusIcon}
                    name='Change'
                />
            </ButtonWrapper>
        </section>


    </Container>
  )
})

/**
 * Injects the mobx store to the global state once initialized
 */
const StoreInjector = observer(({ children }) => {
  const appStore = useStore()
  const [shouldRenderContent, setShouldRenderContent] = useState(false)

  useEffect(() => {
    if (!appStore || !appStore.appRuntime) return
    if (typeof appStore.hellowrldApp !== 'undefined') return
    appStore.helloworldApp = createHelloWorldAppStore({})
  }, [appStore])

  useEffect(() => reaction(
    () => appStore.helloworldApp,
    () => {
      if (appStore.helloworldApp && !shouldRenderContent) {
        setShouldRenderContent(true)
      }
    },
    { fireImmediately: true })
  )

  return shouldRenderContent && children;
})

export default () => (
  <UnlockRequired>
    <StoreInjector>
      <AppHeader />
      <AppBody />
    </StoreInjector>
  </UnlockRequired>
)
