import mskelton from '@mskelton/eslint-config'

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...mskelton.recommended,
  {
    ignores: ['out/**/*'],
  },
]
