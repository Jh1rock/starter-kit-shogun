/**
 *
 * MIT License
 *
 * Copyright 2021 Shogun, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
 * OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import * as React from 'react'
import { useCustomerActions } from 'frontend-customer'
import { useRouter } from 'frontend-router'

import Button from 'Components/Button'
import Container from 'Components/Container'
import Grid from 'Components/Grid'
import Heading from 'Components/Heading'
import Input from 'Components/Input'
import Text from 'Components/Text'
import { useIsMounted } from 'Components/Hooks'
import FormControl from 'Components/FormControl'
import FormLabel from 'Components/FormLabel'
import AuthGuard from 'Components/AuthGuard'
import { ACCOUNT_URL, ACCOUNT_LOGIN_URL } from 'Components/Data'

const ChangePasswordForm = () => {
  const [isLoading, setIsLoading] = React.useState(false)
  /**
   * @typedef { import("frontend-customer/dist/customer-sdk/platforms/big_commerce/rest/types/api").BigCommerceApiError } BigCommerceApiError
   * @typedef { import("frontend-customer/dist/customer-sdk/platforms/shopify/storefront-api/types/api").CustomerUserError } CustomerUserError
   * @typedef { ( BigCommerceApiError[] | CustomerUserError[] | null | undefined ) } FrontendErrors
   * @type { [FrontendErrors, React.Dispatch<React.SetStateAction<FrontendErrors>> ] }
   */
  const [formErrors, setFormErrors] = React.useState()
  const [formData, setFormData] = React.useState({
    password: '',
    confirmPassword: '',
  })
  const { updateCustomer, resetPassword } = useCustomerActions()
  const router = useRouter()
  const isMounted = useIsMounted()

  /** @type { string | undefined }  */
  // @ts-ignore
  const resetUrl = router.query['resetUrl']

  const fieldsDisabled = isLoading
  const submitDisabled =
    fieldsDisabled || formData.password === '' || formData.confirmPassword === ''

  /**
   * @param {React.KeyboardEvent<HTMLDivElement>} event
   */
  const handleSubmit = async event => {
    event.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      setFormErrors([{ message: "Passwords don't match" }])

      return
    }

    setFormErrors(null)
    setIsLoading(true)

    /** @type { FrontendErrors } */
    let newFormErrors

    try {
      const result = resetUrl
        ? await resetPassword({
            resetUrl,
            password: formData.password,
          })
        : await updateCustomer({ newPassword: formData.password })

      newFormErrors = result && result.errors
    } catch (/** @type { any } */ error) {
      newFormErrors = [error]
    }

    if (!isMounted.current) return

    setIsLoading(false)

    if (newFormErrors) {
      setFormErrors(newFormErrors)

      return
    }

    router.push(ACCOUNT_LOGIN_URL)
  }

  return (
    <Container as="section" w={{ base: 'full', md: 'md' }} variant="section-wrapper-centered">
      <Heading as="h1" mb={6}>
        {resetUrl ? 'Reset password' : 'Change password'}
      </Heading>

      <AuthGuard
        allowedAuthStatus={resetUrl ? 'unauthenticated' : 'authenticated'}
        redirectUrl={resetUrl ? ACCOUNT_URL : ACCOUNT_LOGIN_URL}
      >
        <Grid as="form" onSubmit={handleSubmit} rowGap={5}>
          <Container as={FormControl} id="password-new-password">
            <FormLabel>New password</FormLabel>
            <Input
              placeholder="******"
              type="password"
              isDisabled={fieldsDisabled}
              onChange={event =>
                setFormData(previousData => ({
                  ...previousData,
                  password: event.target.value,
                }))
              }
              isInvalid={Boolean(formErrors)}
              isRequired
            />
          </Container>
          <Container as={FormControl} id="password-confirm-password">
            <FormLabel>Confirm new password</FormLabel>
            <Input
              placeholder="******"
              type="password"
              isDisabled={fieldsDisabled}
              onChange={event =>
                setFormData(previousData => ({
                  ...previousData,
                  confirmPassword: event.target.value,
                }))
              }
              isInvalid={Boolean(formErrors)}
              isRequired
            />
          </Container>
          <Container>
            <Button
              isDisabled={submitDisabled}
              isLoading={isLoading}
              loadingText="Submitting..."
              type="submit"
              width={{ base: '100%', md: 48 }}
            >
              Submit
            </Button>
          </Container>
          {formErrors && (
            <Container>
              {formErrors.map(({ message }, index) => (
                <Text key={`error-message-${index}`} color="red.600">
                  {message}
                </Text>
              ))}
            </Container>
          )}
        </Grid>
      </AuthGuard>
    </Container>
  )
}

export default ChangePasswordForm
