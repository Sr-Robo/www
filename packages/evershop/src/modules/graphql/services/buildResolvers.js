import path from 'path';
import url from 'url';
import { loadFiles } from '@graphql-tools/load-files';
import { mergeResolvers } from '@graphql-tools/merge';
import { getEnabledExtensions } from '../../../bin/extension/index.js';
import { CONSTANTS } from '../../../lib/helpers.js';
import { isDevelopmentMode } from '../../../lib/util/isDevelopmentMode.js';

export async function buildResolvers(isAdmin = false) {
  // Load core and extension resolvers in two passes and concatenate the
  // extension results LAST before merging. loadFiles flattens an array of
  // glob patterns into a single list sorted by path, where "extensions/..."
  // sorts before "packages/..."; merged in that order, core resolvers ended
  // up last in mergeResolvers' mergeDeep (last one wins) and silently beat
  // resolver overrides coming from extensions.
  const coreSources = [
    path.join(CONSTANTS.MODULESPATH, '*/graphql/types/**/*.resolvers.{js,ts}')
  ];
  const extensionSources = getEnabledExtensions().map((extension) =>
    path.join(extension.path, 'graphql/types/**/*.resolvers.{js,ts}')
  );

  const loadOptions = {
    ignoredExtensions: isAdmin
      ? ['.ts', '.d.ts']
      : ['.admin.resolvers.js', '.admin.resolvers.ts', '.ts', '.d.ts'],
    requireMethod: async (path) => {
      if (isDevelopmentMode()) {
        const module = await import(
          `${url.pathToFileURL(path)}?t=${Date.now()}`
        );
        return module;
      } else {
        const module = await import(url.pathToFileURL(path));
        return module;
      }
    }
  };

  const coreResolvers = await loadFiles(coreSources, loadOptions);
  const extensionResolvers = await loadFiles(extensionSources, loadOptions);

  return mergeResolvers([...coreResolvers, ...extensionResolvers]);
}
