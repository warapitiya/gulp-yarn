import tap from 'tap'

import { formatArgument, formatArguments, resolveYarnOptions } from '../src/utils'

tap.test('formatArgument() returns formatted argument', (t) => {
  t.plan(8)
  t.equal(formatArgument('production'), 'production')
  t.equal(formatArgument('--production'), '--production')
  t.equal(formatArgument('-production'), '-production')
  t.equal(formatArgument('production --nice-work'), 'production --nice-work')
  t.equal(formatArgument('--production nice-work'), '--production nice-work')
  t.equal(formatArgument('--production -nice-work'), '--production -nice-work')
  t.equal(formatArgument(' --production --nice-work '), '--production --nice-work')
  t.end()
})

tap.test('formatArguments() returns formatted arguments', (t) => {
  t.plan(9)
  t.same(formatArguments(['production']), ['production'])
  t.same(formatArguments(['--production']), ['--production'])
  t.same(formatArguments(['-production']), ['-production'])
  t.same(formatArguments(['production', '--nice-work']), ['production', '--nice-work'])
  t.same(formatArguments(['--production', 'nice-work']), ['--production', 'nice-work'])
  t.same(formatArguments(['--production', '-nice-work']), ['--production', '-nice-work'])
  t.same(formatArguments(['--production', '    --nice-work']), ['--production', '--nice-work'])
  t.same(formatArguments(['--production', '    -nice-work  ']), ['--production', '-nice-work'])
  t.same(formatArguments('--production    -nice-work'), ['--production    -nice-work'])
  t.end()
})

tap.test('resolveYarnOptions() can resolve passed options', (t) => {
  // @ts-expect-error Unit testing purpose passing invalid property
  let [error] = resolveYarnOptions({ test: true })
  t.equal(error?.message, '\'test\' option is not supported by the plugin. Please use \'args\' option.')

  let [arg1, arg2] = resolveYarnOptions({ dev: true })
  t.equal(arg1, null)
  t.same(arg2, ['--dev']);

  // @ts-expect-error Unit testing purpose
  [error] = resolveYarnOptions({ args: {} })
  t.equal(error?.message, '"Args" option is not in valid type.');

  [arg1, arg2] = resolveYarnOptions({ args: ['done'] })
  t.equal(arg1, null)
  t.same(arg2, ['done']);

  [arg1, arg2] = resolveYarnOptions({ force: true, args: '--registry https://www.google.com' })
  t.equal(arg1, null)
  t.same(arg2, ['--force', '--registry https://www.google.com']);

  [arg1, arg2] = resolveYarnOptions()
  t.equal(arg1, null)
  t.same(arg2, [])
  t.end()
})
